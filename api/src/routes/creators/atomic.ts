import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getUserFromContext } from '../../middleware/auth';
import { AtomicService } from '../../services/atomic';
import type { Env } from '../../types';

const router = new Hono<{ Bindings: Env }>();

// Schema for atomic operations
const atomicOperationSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('createAdventure'),
        data: z.object({
            title: z.string().min(1).max(100),
            description: z.string().min(1).max(1000),
            isPublished: z.boolean().optional(),
        }),
    }),
    z.object({
        type: z.literal('updateAdventure'),
        id: z.string().min(1),
        data: z.object({
            title: z.string().min(1).max(100),
            description: z.string().min(1).max(1000),
            isPublished: z.boolean().optional(),
        }),
    }),
    z.object({
        type: z.literal('deleteAdventure'),
        id: z.string().min(1),
    }),
    z.object({
        type: z.literal('createScene'),
        adventureId: z.string().min(1),
        id: z.string().min(1).optional(),
        data: z.object({
            title: z.string().min(1).max(100),
            content: z.string().min(1),
            imageUrl: z.string().url().optional().nullable(),
            isStartScene: z.boolean().optional(),
            order: z.number().int().min(0),
        }),
    }),
    z.object({
        type: z.literal('updateScene'),
        id: z.string().min(1),
        data: z.object({
            title: z.string().min(1).max(100),
            content: z.string().min(1),
            imageUrl: z.string().url().optional().nullable(),
            isStartScene: z.boolean().optional(),
            order: z.number().int().min(0),
        }),
    }),
    z.object({
        type: z.literal('deleteScene'),
        id: z.string().min(1),
        redirectProgressionToSceneId: z.string().min(1),
    }),
    z.object({
        type: z.literal('createChoice'),
        fromSceneId: z.string().min(1),
        id: z.string().min(1).optional(),
        data: z.object({
            text: z.string().min(1).max(500),
            toSceneId: z.string().min(1),
            imageUrl: z.string().url().optional().nullable(),
            condition: z.string().optional(),
            order: z.number().int().min(0),
        }),
    }),
    z.object({
        type: z.literal('updateChoice'),
        id: z.string().min(1),
        data: z.object({
            text: z.string().min(1).max(500),
            toSceneId: z.string().min(1),
            imageUrl: z.string().url().optional().nullable(),
            condition: z.string().optional(),
            order: z.number().int().min(0),
        }),
    }),
    z.object({
        type: z.literal('deleteChoice'),
        id: z.string().min(1),
    }),
]);

const atomicRequestSchema = z.object({
    operations: z.array(atomicOperationSchema),
});

// Execute atomic operations
router.post('/', zValidator('json', atomicRequestSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const request = c.req.valid('json');
    const atomicService = new AtomicService(c.env.DB);

    try {
        const result = await atomicService.executeAtomicOperations(userId, request);
        return c.json(result);
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});

export default router; 