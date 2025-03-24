import { useCallback, useState } from 'react';
import ReactFlow, {
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SceneNode } from './SceneNode';
import { ChoiceNode } from './ChoiceNode';
import { useStoryStore, StoryNode } from '../../stores/storyStore';
import { Plus, Trash2 } from 'lucide-react';

const nodeTypes: NodeTypes = {
    scene: SceneNode,
    choice: ChoiceNode,
};

export function StoryEditor() {
    const { nodes, edges, addNode, addEdge: addEdgeToStore, deleteNode, setNodes, setEdges } = useStoryStore();
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const onConnect = useCallback(
        (connection: Connection) => {
            const newEdges = addEdge(connection, edges);
            setEdges(newEdges);
            addEdgeToStore(connection);
        },
        [edges, setEdges, addEdgeToStore]
    );

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            const newNodes = [...nodes];
            changes.forEach((change) => {
                if (change.type === 'position' && change.dragging === false && change.position) {
                    const node = newNodes.find((n) => n.id === change.id);
                    if (node) {
                        node.position = change.position as XYPosition;
                    }
                }
            });
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
        },
        [deleteNode]
    );

    return (
        <div className="w-full h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg relative">
            <div className="absolute top-4 left-4 z-20 flex gap-2">
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
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => setSelectedNode(node)}
                fitView
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            >
                <Background />
                <Controls className="!bg-transparent [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-300 [&>button:hover]:!bg-gray-700" />
                <MiniMap className="!bg-gray-800 !border-gray-700" />
            </ReactFlow>
        </div>
    );
} 