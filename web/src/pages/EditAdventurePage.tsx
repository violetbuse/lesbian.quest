import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useToast } from '../components/Toast';
import { Adventure } from '../types';
import { useAdventureEditor } from '../hooks/useAdventureEditor';
import { StoryEditor } from '../components/story/StoryEditor';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function AdventureForm({ title, description, isPublished, onTitleChange, onDescriptionChange, onPublishedChange, onSubmit, isSubmitting, hasChanges }: {
    title: string;
    description: string;
    isPublished: boolean;
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onPublishedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    hasChanges: () => boolean;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={onTitleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                    maxLength={100}
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={onDescriptionChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                    maxLength={1000}
                />
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isPublished"
                    checked={isPublished}
                    onChange={onPublishedChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Publish adventure
                </label>
            </div>
        </form>
    );
}

export function EditAdventurePage() {
    const { adventureId } = useParams<{ adventureId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { data: adventure, error, isLoading } = useSWR<Adventure>(
        adventureId ? `/api/creators/adventures/${adventureId}` : null,
        fetcher
    );

    const { updateAdventure, saveChanges, isSubmitting, hasChanges } = useAdventureEditor({
        adventureId: adventureId!,
        onSuccess: () => navigate('/my-adventures'),
    });

    // Update form state when adventure data is loaded
    if (adventure && !title) {
        setTitle(adventure.title);
        setDescription(adventure.description);
        setIsPublished(adventure.isPublished);
    }

    if (error) {
        showToast('Failed to load adventure');
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center text-red-600">Failed to load adventure</div>
                    </div>
                </main>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">Loading...</div>
                    </div>
                </main>
            </div>
        );
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        updateAdventure({ title: newTitle });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newDescription = e.target.value;
        setDescription(newDescription);
        updateAdventure({ description: newDescription });
    };

    const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newIsPublished = e.target.checked;
        setIsPublished(newIsPublished);
        updateAdventure({ isPublished: newIsPublished });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveChanges();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Mobile Form */}
                        <div className="lg:hidden">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                            >
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Adventure</h1>
                                <AdventureForm
                                    title={title}
                                    description={description}
                                    isPublished={isPublished}
                                    onTitleChange={handleTitleChange}
                                    onDescriptionChange={handleDescriptionChange}
                                    onPublishedChange={handlePublishedChange}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    hasChanges={hasChanges}
                                />
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/my-adventures')}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !hasChanges()}
                                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden lg:flex flex-1 gap-6">
                            {/* Sidebar */}
                            <Collapsible.Root
                                open={isSidebarOpen}
                                onOpenChange={setIsSidebarOpen}
                                className="relative"
                            >
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-12'}`}
                                >
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                        {isSidebarOpen && <h2 className={`text-lg font-semibold text-gray-900 dark:text-white transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                                            Edit Details
                                        </h2>}
                                        <button
                                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                            className="flex items-center justify-center w-5 h-5"
                                        >
                                            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <Collapsible.Content className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                                        <div className="p-4">
                                            <AdventureForm
                                                title={title}
                                                description={description}
                                                isPublished={isPublished}
                                                onTitleChange={handleTitleChange}
                                                onDescriptionChange={handleDescriptionChange}
                                                onPublishedChange={handlePublishedChange}
                                                onSubmit={handleSubmit}
                                                isSubmitting={isSubmitting}
                                                hasChanges={hasChanges}
                                            />
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/my-adventures')}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting || !hasChanges()}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </div>
                                    </Collapsible.Content>
                                </motion.div>
                            </Collapsible.Root>

                            {/* Main Content */}
                            <div className="flex-1">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                                >
                                    <StoryEditor adventureId={adventureId || ""} showToast={showToast} />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 