import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getUserFromContext } from '../../middleware/auth';
import { ProgressService } from '../../services/progress';
import type { Env } from '../../types';

const progressRouter = new Hono<{ Bindings: Env }>();

// Schema for request validation
const createProgressSchema = z.object({
    adventureId: z.string(),
    currentSceneId: z.string(),
    variables: z.record(z.any()).default({}),
});

const updateProgressSchema = z.object({
    currentSceneId: z.string().optional(),
    variables: z.record(z.any()).optional(),
});

// Get progress for a specific adventure
progressRouter.get('/:adventureId', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const adventureId = c.req.param('adventureId');
    const progressService = new ProgressService(c.env.DB);

    const progress = await progressService.getProgress(userId, adventureId);
    if (!progress) {
        return c.json({ error: 'Progress not found' }, 404);
    }

    return c.json(progress);
});

// Create new progress for an adventure
progressRouter.post('/', zValidator('json', createProgressSchema), async (c) => {
    const userId = await getUserFromContext(c);
    console.log({ userId })
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const data = c.req.valid('json');
    const progressService = new ProgressService(c.env.DB);

    const progress = await progressService.createProgress(userId, data);
    return c.json(progress, 201);
});

// Update progress for an adventure
progressRouter.patch('/:adventureId', zValidator('json', updateProgressSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const adventureId = c.req.param('adventureId');
    const data = c.req.valid('json');
    const progressService = new ProgressService(c.env.DB);

    const progress = await progressService.updateProgress(userId, adventureId, data);
    if (!progress) {
        return c.json({ error: 'Progress not found' }, 404);
    }

    return c.json(progress);
});

// Delete progress for an adventure
progressRouter.delete('/:adventureId', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const adventureId = c.req.param('adventureId');
    const progressService = new ProgressService(c.env.DB);

    const success = await progressService.deleteProgress(userId, adventureId);
    if (!success) {
        return c.json({ error: 'Progress not found' }, 404);
    }

    return c.json({ success: true });
});

export default progressRouter; 