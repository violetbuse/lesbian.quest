import { useState } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { useAuth } from '@clerk/clerk-react';
import { CreateAdventureModal } from '../components/CreateAdventureModal';
import { Navbar } from '../components/Navbar';
import { Adventure } from '../types';

const AdventureCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
  >
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4 animate-pulse"></div>
    <div className="flex justify-between items-center">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
      <div className="flex gap-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  </motion.div>
);

export function MyAdventuresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getToken } = useAuth();
  const { data: createdAdventures, error: createdError, isLoading: isLoadingCreated, mutate: mutateCreated } = useSWR<Adventure[]>('/api/creators/adventures');
  const { data: interactions, error: interactionsError, isLoading: isLoadingInteractions, mutate: mutateInteractions } = useSWR<{
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
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[200px]">{adventure.title}</h2>
        <p className="text-gray-500 dark:text-gray-400 flex-1 truncate">{adventure.description}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">
          {new Date(adventure.createdAt).toLocaleDateString()}
        </p>
        {type === 'created' && (
          <div className="flex gap-2 whitespace-nowrap">
            <button
              onClick={() => handleFavorite(adventure.id)}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
            >
              Favorite
            </button>
            <button
              onClick={() => handleLike(adventure.id)}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
            >
              Like
            </button>
            <button
              onClick={() => handleSave(adventure.id)}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Adventures</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900"
            >
              Create New Adventure
            </button>
          </div>

          {isLoadingCreated && isLoadingInteractions ? (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Created Adventures</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <AdventureCardSkeleton key={i} />
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Favorites</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <AdventureCardSkeleton key={i} />
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Liked Adventures</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <AdventureCardSkeleton key={i} />
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Saved Adventures</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <AdventureCardSkeleton key={i} />
                  ))}
                </div>
              </section>
            </div>
          ) : adventures.length === 0 && favorites.length === 0 && likes.length === 0 && saves.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            >
              <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't created or interacted with any adventures yet.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
              >
                Create your first adventure
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {adventures.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Created Adventures</h2>
                  <div className="space-y-4">
                    {adventures.map((adventure) => (
                      <AdventureCard key={adventure.id} adventure={adventure} type="created" />
                    ))}
                  </div>
                </section>
              )}

              {favorites.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Favorites</h2>
                  <div className="space-y-4">
                    {favorites.map((adventure) => (
                      <AdventureCard key={adventure.id} adventure={adventure} type="favorite" />
                    ))}
                  </div>
                </section>
              )}

              {likes.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Liked Adventures</h2>
                  <div className="space-y-4">
                    {likes.map((adventure) => (
                      <AdventureCard key={adventure.id} adventure={adventure} type="like" />
                    ))}
                  </div>
                </section>
              )}

              {saves.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Saved Adventures</h2>
                  <div className="space-y-4">
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