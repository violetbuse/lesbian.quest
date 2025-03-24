import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Node, Edge, Connection, addEdge } from 'reactflow';

export interface StoryNode {
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

interface StoryStore {
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

export const useStoryStore = create<StoryStore>((set, get) => ({
    nodes: [],
    edges: [],
    addNode: (node) => {
        set((state) => ({
            nodes: [
                ...state.nodes,
                {
                    ...node,
                    id: nanoid(),
                },
            ],
        }));
    },
    updateNode: (id, data) => {
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === id
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            ...data,
                        },
                    }
                    : node
            ),
        }));
    },
    deleteNode: (id) => {
        set((state) => ({
            nodes: state.nodes.filter((node) => node.id !== id),
            edges: state.edges.filter(
                (edge) => edge.source !== id && edge.target !== id
            ),
        }));
    },
    addEdge: (connection) => {
        set((state) => ({
            edges: addEdge(connection, state.edges),
        }));
    },
    deleteEdge: (id) => {
        set((state) => ({
            edges: state.edges.filter((edge) => edge.id !== id),
        }));
    },
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
})); 