import { useCallback, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    Connection,
    Node,
    NodeTypes,
    OnNodesChange,
    OnEdgesChange,
    Edge,
    XYPosition,
    applyNodeChanges,
    MarkerType,
} from '@xyflow/react';
import { SceneNode } from './SceneNode';
import { ChoiceNode } from './ChoiceNode';
import { useStoryStore, StoryNode } from '../../stores/storyStore';
import { Plus, Trash2 } from 'lucide-react';

const nodeTypes: NodeTypes = {
    scene: SceneNode,
    choice: ChoiceNode,
};

interface StoryEditorProps {
    showToast: (message: string, type?: 'error' | 'success') => void;
}

export function StoryEditor({ showToast }: StoryEditorProps) {
    const { nodes, edges, addNode, addEdge: addEdgeToStore, deleteNode, deleteEdge, setNodes, setEdges } = useStoryStore();
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

    const onConnect = useCallback(
        (connection: Connection) => {
            // Find the source and target nodes
            const sourceNode = nodes.find((node) => node.id === connection.source);
            const targetNode = nodes.find((node) => node.id === connection.target);

            // Only allow connections between scenes and choices
            if (!sourceNode || !targetNode) return;

            // Scene can only connect to Choice
            if (sourceNode.type === 'scene' && targetNode.type !== 'choice') {
                showToast('Scenes can only connect to choices');
                return;
            }

            // Choice can only connect to Scene
            if (sourceNode.type === 'choice' && targetNode.type !== 'scene') {
                showToast('Choices can only connect to scenes');
                return;
            }

            // Check if the choice already has an outgoing connection
            if (sourceNode.type === 'choice') {
                const existingConnection = edges.find(edge => edge.source === sourceNode.id);
                if (existingConnection) {
                    showToast('A choice can only lead to one scene');
                    return;
                }
            }

            const newEdges = addEdge(
                {
                    ...connection,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 20,
                        height: 20,
                        color: '#9333ea', // purple-600
                    },
                },
                edges
            );
            setEdges(newEdges);
            addEdgeToStore(connection);
        },
        [edges, setEdges, addEdgeToStore, nodes, showToast]
    );

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            const newNodes = applyNodeChanges(changes, nodes);
            setNodes(newNodes);
        },
        [nodes, setNodes]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            const newEdges = [...edges];
            changes.forEach((change) => {
                if (change.type === 'remove') {
                    const index = newEdges.findIndex((e) => e.id === change.id);
                    if (index !== -1) {
                        newEdges.splice(index, 1);
                    }
                }
            });
            setEdges(newEdges);
        },
        [edges, setEdges]
    );

    const handleAddNode = useCallback(
        (type: 'scene' | 'choice') => {
            const newNode: Omit<StoryNode, 'id'> = {
                type,
                data: {
                    title: `New ${type}`,
                    content: '',
                },
                position: {
                    x: Math.random() * 500,
                    y: Math.random() * 500,
                },
            };
            addNode(newNode);
        },
        [addNode]
    );

    const handleDeleteNode = useCallback(
        (nodeId: string) => {
            deleteNode(nodeId);
            setSelectedNode(null);
        },
        [deleteNode]
    );

    const handleDeleteEdge = useCallback(
        (edgeId: string) => {
            deleteEdge(edgeId);
            setSelectedEdge(null);
        },
        [deleteEdge]
    );

    return (
        <div className="w-full h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg relative">
            <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => handleAddNode('scene')}
                    className="px-3 py-1 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800"
                >
                    <Plus className="w-4 h-4 inline-block mr-1" />
                    Add Scene
                </button>
                <button
                    onClick={() => handleAddNode('choice')}
                    className="px-3 py-1 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-offset-gray-800"
                >
                    <Plus className="w-4 h-4 inline-block mr-1" />
                    Add Choice
                </button>
                {selectedNode && (
                    <button
                        onClick={() => handleDeleteNode(selectedNode.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                    >
                        <Trash2 className="w-4 h-4 inline-block mr-1" />
                        Delete Node
                    </button>
                )}
                {selectedEdge && (
                    <button
                        onClick={() => handleDeleteEdge(selectedEdge.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                    >
                        <Trash2 className="w-4 h-4 inline-block mr-1" />
                        Delete Edge
                    </button>
                )}
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => {
                    setSelectedNode(node);
                    setSelectedEdge(null);
                }}
                onEdgeClick={(_, edge) => {
                    setSelectedEdge(edge);
                    setSelectedNode(null);
                }}
                fitView
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                className="w-full h-full"
            >
                <Background />
                <Controls className="!bg-transparent [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-300 [&>button:hover]:!bg-gray-700" />
                <MiniMap />
            </ReactFlow>
        </div>
    );
} 