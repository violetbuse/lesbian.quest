import { Handle, Position } from '@xyflow/react';
import { StoryNode } from '../../stores/storyStore';

interface SceneNodeProps {
    data: StoryNode['data'];
    selected?: boolean;
}

export function SceneNode({ data, selected }: SceneNodeProps) {
    return (
        <div className={`min-w-[200px] min-h-[100px] px-4 py-2 shadow-lg rounded-lg transition-all duration-200 ${selected
            ? 'bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-700 dark:border-purple-300 ring-4 ring-purple-500/50 dark:ring-purple-400/50 shadow-purple-200 dark:shadow-purple-900'
            : 'bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400'
            } relative`}>
            <Handle type="target" position={Position.Top} className={`w-3 h-3 ${selected ? '!bg-purple-700 dark:!bg-purple-300' : '!bg-purple-500'}`} />
            <div className={`font-bold mb-2 ${selected ? 'text-purple-700 dark:text-purple-300' : 'text-purple-600 dark:text-purple-400'}`}>
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
            <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${selected ? '!bg-purple-700 dark:!bg-purple-300' : '!bg-purple-500'}`} />
        </div>
    );
} 