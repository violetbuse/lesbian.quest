import { Handle, Position } from 'reactflow';
import { StoryNode } from '../../stores/storyStore';

interface SceneNodeProps {
    data: StoryNode['data'];
}

export function SceneNode({ data }: SceneNodeProps) {
    return (
        <div className="min-w-[200px] min-h-[100px] px-4 py-2 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400 relative">
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-purple-500" />
            <div className="font-bold text-purple-600 dark:text-purple-400 mb-2">
                {data.title || 'Untitled Scene'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
                {data.content || 'No content'}
            </div>
            {data.isStartScene && (
                <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Start
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-500" />
        </div>
    );
} 