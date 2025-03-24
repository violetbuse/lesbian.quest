import { Handle, Position } from '@xyflow/react';
import { StoryNode } from '../../stores/storyStore';

interface ChoiceNodeProps {
    data: StoryNode['data'];
    selected?: boolean;
}

export function ChoiceNode({ data, selected }: ChoiceNodeProps) {
    return (
        <div className={`min-w-[200px] min-h-[100px] px-4 py-2 shadow-lg rounded-lg transition-all duration-200 ${selected
            ? 'bg-pink-50 dark:bg-pink-900/30 border-2 border-pink-700 dark:border-pink-300 ring-4 ring-pink-500/50 dark:ring-pink-400/50 shadow-pink-200 dark:shadow-pink-900'
            : 'bg-white dark:bg-gray-800 border-2 border-pink-500 dark:border-pink-400'
            } relative`}>
            <Handle type="target" position={Position.Top} className={`w-3 h-3 ${selected ? '!bg-pink-700 dark:!bg-pink-300' : '!bg-pink-500'}`} />
            <div className={`font-bold mb-2 ${selected ? 'text-pink-700 dark:text-pink-300' : 'text-pink-600 dark:text-pink-400'}`}>
                {data.title || 'Untitled Choice'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
                {data.content || 'No content'}
            </div>
            {data.condition && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Condition: {data.condition}
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${selected ? '!bg-pink-700 dark:!bg-pink-300' : '!bg-pink-500'}`} />
        </div>
    );
} 