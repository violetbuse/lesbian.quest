import { useState } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { useAuth } from '@clerk/clerk-react';
import { CreateAdventureModal } from '../components/CreateAdventureModal';
import { Navbar } from '../components/Navbar';
import { AdventureCard } from '../components/AdventureCard';
import { useToast } from '../components/Toast';
import { Adventure } from '../types';
import { Star, Heart, Bookmark, PenSquare } from 'lucide-react';

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
  const { showToast } = useToast();
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
      showToast('Adventure created successfully!', 'success');
    } catch (err) {
      console.error('Failed to create adventure:', err);
      showToast('Failed to create adventure. Please try again.');
    }
  };

  if (createdError) {
    showToast('Failed to load created adventures');
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
    showToast('Failed to load interactions');
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

  // Combine and deduplicate adventures
  const allAdventures = new Map<string, { adventure: Adventure; types: Set<string> }>();

  // Add created adventures
  createdAdventures?.forEach(adventure => {
    allAdventures.set(adventure.id, { adventure, types: new Set(['created']) });
  });

  // Add favorites
  interactions?.favorites.forEach(adventure => {
    const existing = allAdventures.get(adventure.id);
    if (existing) {
      existing.types.add('favorite');
    } else {
      allAdventures.set(adventure.id, { adventure, types: new Set(['favorite']) });
    }
  });

  // Add likes
  interactions?.likes.forEach(adventure => {
    const existing = allAdventures.get(adventure.id);
    if (existing) {
      existing.types.add('like');
    } else {
      allAdventures.set(adventure.id, { adventure, types: new Set(['like']) });
    }
  });

  // Add saves
  interactions?.saves.forEach(adventure => {
    const existing = allAdventures.get(adventure.id);
    if (existing) {
      existing.types.add('save');
    } else {
      allAdventures.set(adventure.id, { adventure, types: new Set(['save']) });
    }
  });

  const uniqueAdventures = Array.from(allAdventures.values());

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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <AdventureCardSkeleton key={i} />
              ))}
            </div>
          ) : uniqueAdventures.length === 0 ? (
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
            <div className="space-y-4">
              {uniqueAdventures.map(({ adventure, types }) => (
                <div key={adventure.id}>
                  <AdventureCard
                    adventureId={adventure.id}
                    type={types.has('created') ? 'created' : (Array.from(types)[0] as 'favorite' | 'like' | 'save')}
                  />
                </div>
              ))}
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