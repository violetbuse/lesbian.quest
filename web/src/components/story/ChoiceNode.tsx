import { Handle, Position } from 'reactflow';
import { StoryNode } from '../../stores/storyStore';

interface ChoiceNodeProps {
    data: StoryNode['data'];
}

export function ChoiceNode({ data }: ChoiceNodeProps) {
    return (
        <div className="min-w-[200px] min-h-[100px] px-4 py-2 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-2 border-pink-500 dark:border-pink-400 relative">
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-pink-500" />
            <div className="font-bold text-pink-600 dark:text-pink-400 mb-2">
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
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-pink-500" />
        </div>
    );
} 