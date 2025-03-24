import { useState, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { Adventure } from '../types';

interface Scene {
    id: string;
    title?: string;
    content?: string;
    imageUrl?: string | null;
    isStartScene?: boolean;
    order?: number;
}

interface Choice {
    id: string;
    text?: string;
    toSceneId?: string;
    imageUrl?: string | null;
    condition?: string;
    order?: number;
}

interface AdventureChanges {
    title?: string;
    description?: string;
    isPublished?: boolean;
    scenes?: Scene[];
    choices?: Choice[];
}

interface UseAdventureEditorProps {
    adventureId: string;
    onSuccess?: () => void;
}

export function useAdventureEditor({ adventureId, onSuccess }: UseAdventureEditorProps) {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [changes, setChanges] = useState<AdventureChanges>({});

    const updateAdventure = useCallback((updates: Partial<Adventure>) => {
        setChanges(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    const updateScene = useCallback((sceneId: string, updates: Partial<Scene>) => {
        setChanges(prev => ({
            ...prev,
            scenes: prev.scenes?.map(scene =>
                scene.id === sceneId ? { ...scene, ...updates } : scene
            ) || [{ id: sceneId, ...updates }]
        }));
    }, []);

    const updateChoice = useCallback((choiceId: string, updates: Partial<Choice>) => {
        setChanges(prev => ({
            ...prev,
            choices: prev.choices?.map(choice =>
                choice.id === choiceId ? { ...choice, ...updates } : choice
            ) || [{ id: choiceId, ...updates }]
        }));
    }, []);

    const saveChanges = useCallback(async () => {
        setIsSubmitting(true);

        try {
            const operations = [];

            // Add adventure update operation if there are changes
            if (changes.title || changes.description || changes.isPublished !== undefined) {
                operations.push({
                    type: 'updateAdventure' as const,
                    id: adventureId,
                    data: {
                        title: changes.title,
                        description: changes.description,
                        isPublished: changes.isPublished,
                    }
                });
            }

            // Add scene update operations
            if (changes.scenes?.length) {
                for (const scene of changes.scenes) {
                    operations.push({
                        type: 'updateScene' as const,
                        id: scene.id,
                        data: {
                            title: scene.title,
                            content: scene.content,
                            imageUrl: scene.imageUrl,
                            isStartScene: scene.isStartScene,
                            order: scene.order,
                        }
                    });
                }
            }

            // Add choice update operations
            if (changes.choices?.length) {
                for (const choice of changes.choices) {
                    operations.push({
                        type: 'updateChoice' as const,
                        id: choice.id,
                        data: {
                            text: choice.text,
                            toSceneId: choice.toSceneId,
                            imageUrl: choice.imageUrl,
                            condition: choice.condition,
                            order: choice.order,
                        }
                    });
                }
            }

            // Execute all operations atomically
            const response = await fetch('/api/creators/atomic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ operations }),
            });

            if (!response.ok) {
                throw new Error('Failed to save changes');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.results[0]?.error || 'Failed to save changes');
            }

            showToast('Changes saved successfully!', 'success');
            setChanges({});
            onSuccess?.();
        } catch (err) {
            console.error('Failed to save changes:', err);
            showToast('Failed to save changes. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [adventureId, changes, onSuccess, showToast]);

    const hasChanges = useCallback(() => {
        return Object.keys(changes).length > 0;
    }, [changes]);

    return {
        changes,
        isSubmitting,
        updateAdventure,
        updateScene,
        updateChoice,
        saveChanges,
        hasChanges,
    };
} 