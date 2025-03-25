import { useCallback, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { Adventure } from '../types';
import useSWR from 'swr';
import { nanoid } from 'nanoid';
import { Node, Edge, Connection } from '@xyflow/react';
import { create } from 'zustand';
import { produce } from 'immer';

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

interface StoryNode {
    id: string;
    type: 'scene' | 'choice';
    data: {
        title: string;
        content: string;
        imageUrl?: string | null;
        isStartScene?: boolean;
        condition?: string;
    };
    position: { x: number; y: number };
}

interface AdventureChanges {
    title?: string;
    description?: string;
    isPublished?: boolean;
    scenes?: Scene[];
    choices?: Choice[];
    nodes?: Node[];
    edges?: Edge[];
}

interface AdventureState {
    adventure: Adventure | null;
    scenes: Scene[];
    choices: Choice[];
    nodes: Node[];
    edges: Edge[];
    changes: AdventureChanges;
    isSubmitting: boolean;
    isLoading: boolean;
    isError: Error | null;
}

interface AdventureActions {
    setAdventure: (adventure: Adventure) => void;
    setScenes: (scenes: Scene[]) => void;
    setChoices: (choices: Choice[]) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    updateAdventure: (updates: Partial<Adventure>) => void;
    updateScene: (sceneId: string, updates: Partial<Scene>) => void;
    updateChoice: (choiceId: string, updates: Partial<Choice>) => void;
    addNode: (node: Omit<StoryNode, 'id'>) => void;
    updateNode: (id: string, data: Partial<StoryNode['data']>) => void;
    deleteNode: (id: string) => void;
    addEdge: (connection: Connection) => void;
    deleteEdge: (id: string) => void;
    setSubmitting: (isSubmitting: boolean) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: Error | null) => void;
    saveChanges: (adventureId: string, onSuccess?: () => void) => Promise<void>;
}

const useAdventureStore = create<AdventureState & AdventureActions>((set, get) => ({
    adventure: null,
    scenes: [],
    choices: [],
    nodes: [],
    edges: [],
    changes: {},
    isSubmitting: false,
    isLoading: false,
    isError: null,

    setAdventure: (adventure) => set({ adventure }),
    setScenes: (scenes) => set({ scenes }),
    setChoices: (choices) => set({ choices }),
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    updateAdventure: (updates) =>
        set(
            produce((state: AdventureState) => {
                state.changes = {
                    ...state.changes,
                    ...updates,
                };
            })
        ),

    updateScene: (sceneId, updates) =>
        set(
            produce((state: AdventureState) => {
                state.changes.scenes = state.changes.scenes?.map((scene) =>
                    scene.id === sceneId ? { ...scene, ...updates } : scene
                ) || [{ id: sceneId, ...updates }];

                state.changes.nodes = state.changes.nodes?.map((node) =>
                    node.id === sceneId
                        ? {
                            ...node,
                            data: {
                                ...node.data,
                                title: updates.title || node.data.title,
                                content: updates.content || node.data.content,
                                imageUrl: updates.imageUrl,
                                isStartScene: updates.isStartScene,
                            },
                        }
                        : node
                );
            })
        ),

    updateChoice: (choiceId, updates) =>
        set(
            produce((state: AdventureState) => {
                state.changes.choices = state.changes.choices?.map((choice) =>
                    choice.id === choiceId ? { ...choice, ...updates } : choice
                ) || [{ id: choiceId, ...updates }];

                state.changes.nodes = state.changes.nodes?.map((node) =>
                    node.id === choiceId
                        ? {
                            ...node,
                            data: {
                                ...node.data,
                                title: updates.text || node.data.title,
                                condition: updates.condition,
                            },
                        }
                        : node
                );
            })
        ),

    addNode: (node) =>
        set(
            produce((state: AdventureState) => {
                const newNode = { ...node, id: nanoid() };
                state.changes.nodes = [...(state.changes.nodes || []), newNode];

                // If it's a scene node, add to scenes
                if (node.type === 'scene') {
                    state.changes.scenes = [
                        ...(state.changes.scenes || []),
                        {
                            id: newNode.id,
                            title: node.data.title,
                            content: node.data.content,
                            imageUrl: node.data.imageUrl,
                            isStartScene: node.data.isStartScene,
                        },
                    ];
                }
                // If it's a choice node, add to choices
                else if (node.type === 'choice') {
                    state.changes.choices = [
                        ...(state.changes.choices || []),
                        {
                            id: newNode.id,
                            text: node.data.title,
                            condition: node.data.condition,
                        },
                    ];
                }
            })
        ),

    updateNode: (id, data) =>
        set(
            produce((state: AdventureState) => {
                const node = state.changes.nodes?.find((n) => n.id === id);
                if (!node) return;

                // Update the node
                state.changes.nodes = state.changes.nodes?.map((n) =>
                    n.id === id
                        ? {
                            ...n,
                            data: {
                                ...n.data,
                                ...data,
                            },
                        }
                        : n
                );

                // Update corresponding scene or choice
                if (node.type === 'scene') {
                    state.changes.scenes = state.changes.scenes?.map((scene) =>
                        scene.id === id
                            ? {
                                ...scene,
                                title: data.title || scene.title,
                                content: data.content || scene.content,
                                imageUrl: data.imageUrl,
                                isStartScene: data.isStartScene,
                            }
                            : scene
                    );
                } else if (node.type === 'choice') {
                    state.changes.choices = state.changes.choices?.map((choice) =>
                        choice.id === id
                            ? {
                                ...choice,
                                text: data.title || choice.text,
                                condition: data.condition,
                            }
                            : choice
                    );
                }
            })
        ),

    deleteNode: (id) =>
        set(
            produce((state: AdventureState) => {
                const node = state.changes.nodes?.find((n) => n.id === id);
                if (!node) return;

                // Delete the node
                state.changes.nodes = state.changes.nodes?.filter((n) => n.id !== id);

                // Delete corresponding scene or choice
                if (node.type === 'scene') {
                    state.changes.scenes = state.changes.scenes?.filter((scene) => scene.id !== id);
                } else if (node.type === 'choice') {
                    state.changes.choices = state.changes.choices?.filter((choice) => choice.id !== id);
                }

                // Delete connected edges
                state.changes.edges = state.changes.edges?.filter(
                    (edge) => edge.source !== id && edge.target !== id
                );
            })
        ),

    addEdge: (connection) =>
        set(
            produce((state: AdventureState) => {
                const newEdge = { ...connection, id: nanoid() };
                state.changes.edges = [...(state.changes.edges || []), newEdge];

                // Update the choice's toSceneId
                if (connection.source) {
                    state.changes.choices = state.changes.choices?.map((choice) =>
                        choice.id === connection.source
                            ? {
                                ...choice,
                                toSceneId: connection.target,
                            }
                            : choice
                    );
                }
            })
        ),

    deleteEdge: (id) =>
        set(
            produce((state: AdventureState) => {
                const edge = state.changes.edges?.find((e) => e.id === id);
                if (!edge) return;

                // Delete the edge
                state.changes.edges = state.changes.edges?.filter((e) => e.id !== id);

                // Clear the choice's toSceneId
                if (edge.source) {
                    state.changes.choices = state.changes.choices?.map((choice) =>
                        choice.id === edge.source
                            ? {
                                ...choice,
                                toSceneId: undefined,
                            }
                            : choice
                    );
                }
            })
        ),

    setSubmitting: (isSubmitting) => set({ isSubmitting }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ isError: error }),

    saveChanges: async (adventureId, onSuccess) => {
        const { changes, setSubmitting } = get();
        setSubmitting(true);

        try {
            const operations = [];

            if (changes.title || changes.description || changes.isPublished !== undefined) {
                operations.push({
                    type: 'updateAdventure' as const,
                    id: adventureId,
                    data: {
                        title: changes.title,
                        description: changes.description,
                        isPublished: changes.isPublished,
                    },
                });
            }

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
                        },
                    });
                }
            }

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
                        },
                    });
                }
            }

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

            set({ changes: {} });
            onSuccess?.();
        } catch (err) {
            console.error('Failed to save changes:', err);
            throw err;
        } finally {
            setSubmitting(false);
        }
    },
}));

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch adventure data');
    }
    return response.json();
};

interface UseAdventureEditorReturn {
    // Adventure data
    adventure: Adventure | null;
    scenes: Scene[];
    choices: Choice[];

    // Loading and error states
    isLoading: boolean;
    isError: Error | null;

    // Changes tracking
    changes: AdventureChanges;
    isSubmitting: boolean;

    // Adventure update methods
    updateAdventure: (updates: Partial<Adventure>) => void;
    updateScene: (sceneId: string, updates: Partial<Scene>) => void;
    updateChoice: (choiceId: string, updates: Partial<Choice>) => void;
    saveChanges: () => Promise<void>;
    hasChanges: () => boolean;

    // Story editor methods
    nodes: Node[];
    edges: Edge[];
    addNode: (node: Omit<StoryNode, 'id'>) => void;
    updateNode: (id: string, data: Partial<StoryNode['data']>) => void;
    deleteNode: (id: string) => void;
    addEdge: (connection: Connection) => void;
    deleteEdge: (id: string) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
}

interface UseAdventureEditorProps {
    adventureId: string;
    onSuccess?: () => void;
}

export function useAdventureEditor({ adventureId, onSuccess }: UseAdventureEditorProps): UseAdventureEditorReturn {
    const { showToast } = useToast();
    const store = useAdventureStore();

    // Fetch adventure data
    const { data: adventureData, error, mutate } = useSWR<{
        adventure: Adventure;
        scenes: Scene[];
        choices: Choice[];
    }>(`/api/creators/adventures/${adventureId}`, fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    // Initialize store when data is loaded
    useEffect(() => {
        if (!adventureData?.adventure) return;

        // Only initialize if we don't have data or if the adventure ID has changed
        if (!store.adventure || store.adventure.id !== adventureData.adventure.id) {
            const nodes: Node[] = [
                ...(adventureData.scenes || []).map((scene) => ({
                    id: scene.id,
                    type: 'scene' as const,
                    data: {
                        title: scene.title || '',
                        content: scene.content || '',
                        imageUrl: scene.imageUrl,
                        isStartScene: scene.isStartScene,
                    },
                    position: { x: 0, y: 0 },
                })),
                ...(adventureData.choices || []).map((choice) => ({
                    id: choice.id,
                    type: 'choice' as const,
                    data: {
                        title: choice.text || '',
                        content: '',
                        condition: choice.condition,
                    },
                    position: { x: 0, y: 0 },
                })),
            ];

            const edges: Edge[] = (adventureData.choices || []).map((choice) => ({
                id: nanoid(),
                source: choice.id,
                target: choice.toSceneId || '',
            }));

            // Batch all store updates together
            store.setAdventure(adventureData.adventure);
            store.setScenes(adventureData.scenes || []);
            store.setChoices(adventureData.choices || []);
            store.setNodes(nodes);
            store.setEdges(edges);
        }
    }, [adventureData?.adventure?.id]); // Only depend on the adventure ID

    const saveChanges = useCallback(async () => {
        try {
            await store.saveChanges(adventureId);
            showToast('Changes saved successfully!', 'success');
            await mutate();
            onSuccess?.();
        } catch (err) {
            showToast('Failed to save changes. Please try again.');
        }
    }, [adventureId, onSuccess, showToast, mutate, store]);

    // Return loading state if we don't have data yet
    if (!adventureData) {
        return {
            adventure: null,
            scenes: [],
            choices: [],
            isLoading: true,
            isError: error,
            changes: {},
            isSubmitting: false,
            updateAdventure: store.updateAdventure,
            updateScene: store.updateScene,
            updateChoice: store.updateChoice,
            saveChanges,
            hasChanges: () => false,
            nodes: [],
            edges: [],
            addNode: store.addNode,
            updateNode: store.updateNode,
            deleteNode: store.deleteNode,
            addEdge: store.addEdge,
            deleteEdge: store.deleteEdge,
            setNodes: store.setNodes,
            setEdges: store.setEdges,
        };
    }

    return {
        adventure: store.adventure,
        scenes: store.scenes,
        choices: store.choices,
        isLoading: false,
        isError: error,
        changes: store.changes,
        isSubmitting: store.isSubmitting,
        updateAdventure: store.updateAdventure,
        updateScene: store.updateScene,
        updateChoice: store.updateChoice,
        saveChanges,
        hasChanges: () => Object.keys(store.changes).length > 0,
        // Story store methods
        nodes: store.nodes,
        edges: store.edges,
        addNode: store.addNode,
        updateNode: store.updateNode,
        deleteNode: store.deleteNode,
        addEdge: store.addEdge,
        deleteEdge: store.deleteEdge,
        setNodes: store.setNodes,
        setEdges: store.setEdges,
    };
} 