import { Handle, Position } from '@xyflow/react';

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

interface ChoiceNodeProps {
    data: StoryNode['data'];
}

export function ChoiceNode({ data }: ChoiceNodeProps) {
    return (
        <div className="px-4 py-2 shadow-lg rounded-lg bg-pink-100 dark:bg-pink-900 border-2 border-pink-500">
            <Handle type="target" position={Position.Top} className="!bg-pink-500" />
            <div className="font-medium text-pink-900 dark:text-pink-100">{data.title}</div>
            {data.condition && (
                <div className="text-sm text-pink-700 dark:text-pink-300">
                    Condition: {data.condition}
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="!bg-pink-500" />
        </div>
    );
} 