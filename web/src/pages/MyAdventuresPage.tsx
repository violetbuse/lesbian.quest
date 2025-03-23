import { useState } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { useAuth } from '@clerk/clerk-react';
import { CreateAdventureModal } from '../components/CreateAdventureModal';
import { Navbar } from '../components/Navbar';
import { Adventure } from '../types';

export function MyAdventuresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getToken } = useAuth();
  const { data: createdAdventures, error: createdError, mutate: mutateCreated } = useSWR<Adventure[]>('/api/creators/adventures');
  const { data: interactions, error: interactionsError, mutate: mutateInteractions } = useSWR<{
    favorites: Adventure[];
    likes: Adventure[];
    saves: Adventure[];
  }>('/api/players/adventures/interactions');

  const handleCreateAdventure = async (data: { title: string; description: string }) => {
    try {
      const response = await fetch('/api/creators/adventures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create adventure');
      }
      const newAdventure = await response.json();
      mutateCreated([...(createdAdventures || []), newAdventure]);
    } catch (err) {
      console.error('Failed to create adventure:', err);
    }
  };

  const handleFavorite = async (adventureId: string) => {
    try {
      const response = await fetch(`/api/players/adventures/${adventureId}/favorite`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to favorite adventure');
      }
      mutateInteractions();
    } catch (err) {
      console.error('Failed to favorite adventure:', err);
    }
  };

  const handleUnfavorite = async (adventureId: string) => {
    try {
      const response = await fetch(`/api/players/adventures/${adventureId}/favorite`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to unfavorite adventure');
      }
      mutateInteractions();
    } catch (err) {
      console.error('Failed to unfavorite adventure:', err);
    }
  };

  const handleLike = async (adventureId: string) => {
    try {
      const response = await fetch(`/api/players/adventures/${adventureId}/like`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to like adventure');
      }
      mutateInteractions();
    } catch (err) {
      console.error('Failed to like adventure:', err);
    }
  };

  const handleUnlike = async (adventureId: string) => {
    try {
      const response = await fetch(`/api/players/adventures/${adventureId}/like`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to unlike adventure');
      }
      mutateInteractions();
    } catch (err) {
      console.error('Failed to unlike adventure:', err);
    }
  };

  const handleSave = async (adventureId: string) => {
    try {
      const response = await fetch(`/api/players/adventures/${adventureId}/save`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to save adventure');
      }
      mutateInteractions();
    } catch (err) {
      console.error('Failed to save adventure:', err);
    }
  };

  const handleUnsave = async (adventureId: string) => {
    try {
      const response = await fetch(`/api/players/adventures/${adventureId}/save`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to unsave adventure');
      }
      mutateInteractions();
    } catch (err) {
      console.error('Failed to unsave adventure:', err);
    }
  };

  const AdventureCard = ({ adventure, type }: { adventure: Adventure; type: 'created' | 'favorite' | 'like' | 'save' }) => (
    <motion.div
      key={adventure.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{adventure.title}</h2>
      <p className="text-gray-500 mb-4">{adventure.description}</p>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">
          Created {new Date(adventure.createdAt).toLocaleDateString()}
        </p>
        {type === 'created' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleFavorite(adventure.id)}
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              Favorite
            </button>
            <button
              onClick={() => handleLike(adventure.id)}
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              Like
            </button>
            <button
              onClick={() => handleSave(adventure.id)}
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (createdError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">Failed to load created adventures</div>
          </div>
        </main>
      </div>
    );
  }

  if (interactionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">Failed to load interactions</div>
          </div>
        </main>
      </div>
    );
  }

  const adventures = createdAdventures || [];
  const favorites = interactions?.favorites || [];
  const likes = interactions?.likes || [];
  const saves = interactions?.saves || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Adventures</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Create New Adventure
            </button>
          </div>

          {adventures.length === 0 && favorites.length === 0 && likes.length === 0 && saves.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-lg shadow-sm"
            >
              <p className="text-gray-500 text-lg">You haven't created or interacted with any adventures yet.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                Create your first adventure
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {adventures.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Created Adventures</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adventures.map((adventure) => (
                      <AdventureCard key={adventure.id} adventure={adventure} type="created" />
                    ))}
                  </div>
                </section>
              )}

              {favorites.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Favorites</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((adventure) => (
                      <AdventureCard key={adventure.id} adventure={adventure} type="favorite" />
                    ))}
                  </div>
                </section>
              )}

              {likes.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Liked Adventures</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {likes.map((adventure) => (
                      <AdventureCard key={adventure.id} adventure={adventure} type="like" />
                    ))}
                  </div>
                </section>
              )}

              {saves.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Saved Adventures</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {saves.map((adventure) => (
                      <AdventureCard key={adventure.id} adventure={adventure} type="save" />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <CreateAdventureModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateAdventure}
      />
    </div>
  );
} 