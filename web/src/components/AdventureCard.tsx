import { motion } from 'framer-motion';
import useSWR from 'swr';
import { Adventure } from '../types';
import { Heart, Star, Bookmark, Flag, PenSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

interface AdventureCardProps {
    adventureId: string;
    type: 'created' | 'favorite' | 'like' | 'save';
}

interface AdventureState {
    isFavorited: boolean;
    isLiked: boolean;
    isSaved: boolean;
    isPlayed: boolean;
}

export function AdventureCard({
    adventureId,
    type,
}: AdventureCardProps) {
    const { getToken } = useAuth();

    const fetcher = useCallback(async (url: string) => {
        const token = await getToken();
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('An error occurred while fetching the data.');
        }
        return response.json();
    }, [getToken]);

    const { data: adventure, error: adventureError } = useSWR<Adventure>(
        `/api/creators/adventures/${adventureId}`,
        fetcher,
        { suspense: true }
    );

    const { data: state, error: stateError, mutate: mutateState } = useSWR<AdventureState>(
        `/api/players/adventures/${adventureId}/state`,
        fetcher,
        { suspense: true }
    );

    const { mutate: mutateInteractions } = useSWR(
        '/api/players/adventures/interactions',
        fetcher,
        { suspense: true }
    );

    if (adventureError) {
        return <div>Error loading adventure.</div>;
    }
    if (!adventure) {
        return <div>Loading...</div>;
    }

    const handleFavorite = useCallback(async () => {
        const method = state?.isFavorited ? 'DELETE' : 'POST';
        const response = await fetch(`/api/players/adventures/${adventureId}/favorite`, {
            method,
            headers: {
                'Authorization': `Bearer ${await getToken()}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            mutateState();
            mutateInteractions();
        }
    }, [state?.isFavorited, adventureId, getToken, mutateState, mutateInteractions]);

    const handleLike = useCallback(async () => {
        const method = state?.isLiked ? 'DELETE' : 'POST';
        const response = await fetch(`/api/players/adventures/${adventureId}/like`, {
            method,
            headers: {
                'Authorization': `Bearer ${await getToken()}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            mutateState();
            mutateInteractions();
        }
    }, [state?.isLiked, adventureId, getToken, mutateState, mutateInteractions]);

    const handleSave = useCallback(async () => {
        const method = state?.isSaved ? 'DELETE' : 'POST';
        const response = await fetch(`/api/players/adventures/${adventureId}/save`, {
            method,
            headers: {
                'Authorization': `Bearer ${await getToken()}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            mutateState();
            mutateInteractions();
        }
    }, [state?.isSaved, adventureId, getToken, mutateState, mutateInteractions]);

    return (
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
                <div className="flex gap-2 whitespace-nowrap">
                    {type === 'created' && (
                        <Link
                            to={`/adventure/${adventureId}/edit`}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                            title="Edit adventure"
                        >
                            <PenSquare className="w-5 h-5" />
                        </Link>
                    )}
                    <button
                        onClick={handleFavorite}
                        className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${state?.isFavorited
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                        title={state?.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <Star className="w-5 h-5" fill={state?.isFavorited ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={handleLike}
                        className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${state?.isLiked
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                        title={state?.isLiked ? 'Unlike' : 'Like'}
                    >
                        <Heart className="w-5 h-5" fill={state?.isLiked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={handleSave}
                        className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${state?.isSaved
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                        title={state?.isSaved ? 'Remove from saves' : 'Save for later'}
                    >
                        <Bookmark className="w-5 h-5" fill={state?.isSaved ? 'currentColor' : 'none'} />
                    </button>
                    <div
                        className={`p-1 rounded-full ${state?.isPlayed
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                        title={state?.isPlayed ? 'Progress made' : 'No progress yet'}
                    >
                        <Flag className="w-5 h-5" fill={state?.isPlayed ? 'currentColor' : 'none'} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
} 