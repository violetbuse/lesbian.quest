import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreateAdventureModal } from '../components/CreateAdventureModal';
import { Navbar } from '../components/Navbar';

interface Adventure {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

export function MyAdventuresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adventures, setAdventures] = useState<Adventure[]>([]);

  const handleCreateAdventure = (data: { title: string; description: string }) => {
    const newAdventure: Adventure = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      createdAt: new Date(),
    };
    setAdventures((prev) => [...prev, newAdventure]);
  };

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

          {adventures.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-lg shadow-sm"
            >
              <p className="text-gray-500 text-lg">You haven't created any adventures yet.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                Create your first adventure
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adventures.map((adventure) => (
                <motion.div
                  key={adventure.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{adventure.title}</h2>
                  <p className="text-gray-500 mb-4">{adventure.description}</p>
                  <p className="text-sm text-gray-400">
                    Created {adventure.createdAt.toLocaleDateString()}
                  </p>
                </motion.div>
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