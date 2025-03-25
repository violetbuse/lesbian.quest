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

interface SceneNodeProps {
    data: StoryNode['data'];
}

export function SceneNode({ data }: SceneNodeProps) {
    return (
        <div className="px-4 py-2 shadow-lg rounded-lg bg-purple-100 dark:bg-purple-900 border-2 border-purple-500">
            <Handle type="target" position={Position.Top} className="!bg-purple-500" />
            <div className="font-medium text-purple-900 dark:text-purple-100">{data.title}</div>
            <div className="text-sm text-purple-700 dark:text-purple-300">{data.content}</div>
            {data.isStartScene && (
                <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                    Start Scene
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
        </div>
    );
} 