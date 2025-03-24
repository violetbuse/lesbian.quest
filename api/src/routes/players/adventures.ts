import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getUserFromContext } from '../../middleware/auth';
import { InteractionsService } from '../../services/interactions';
import type { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();

// Schema for URL parameter validation
const adventureIdSchema = z.object({
    adventureId: z.string(),
});

// Favorite routes
app.post('/:adventureId/favorite', zValidator('param', adventureIdSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const { adventureId } = c.req.valid('param');
    const interactionsService = new InteractionsService(c.env.DB);

    const success = await interactionsService.addFavorite(userId, adventureId);
    if (!success) {
        return c.json({ error: 'Already favorited' }, 400);
    }

    return c.json({ success: true });
});

app.delete('/:adventureId/favorite', zValidator('param', adventureIdSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const { adventureId } = c.req.valid('param');
    const interactionsService = new InteractionsService(c.env.DB);

    await interactionsService.removeFavorite(userId, adventureId);
    return c.json({ success: true });
});

// Like routes
app.post('/:adventureId/like', zValidator('param', adventureIdSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const { adventureId } = c.req.valid('param');
    const interactionsService = new InteractionsService(c.env.DB);

    const success = await interactionsService.addLike(userId, adventureId);
    if (!success) {
        return c.json({ error: 'Already liked' }, 400);
    }

    return c.json({ success: true });
});

app.delete('/:adventureId/like', zValidator('param', adventureIdSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const { adventureId } = c.req.valid('param');
    const interactionsService = new InteractionsService(c.env.DB);

    await interactionsService.removeLike(userId, adventureId);
    return c.json({ success: true });
});

// Save routes
app.post('/:adventureId/save', zValidator('param', adventureIdSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const { adventureId } = c.req.valid('param');
    const interactionsService = new InteractionsService(c.env.DB);

    const success = await interactionsService.addSave(userId, adventureId);
    if (!success) {
        return c.json({ error: 'Already saved' }, 400);
    }

    return c.json({ success: true });
});

app.delete('/:adventureId/save', zValidator('param', adventureIdSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const { adventureId } = c.req.valid('param');
    const interactionsService = new InteractionsService(c.env.DB);

    await interactionsService.removeSave(userId, adventureId);
    return c.json({ success: true });
});

// Get user's interactions
app.get('/interactions', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const interactionsService = new InteractionsService(c.env.DB);
    const interactions = await interactionsService.getUserInteractions(userId);
    return c.json(interactions);
});

// Get state of a specific adventure
app.get('/:adventureId/state', zValidator('param', adventureIdSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const { adventureId } = c.req.valid('param');
    const interactionsService = new InteractionsService(c.env.DB);

    const state = await interactionsService.getAdventureState(userId, adventureId);
    return c.json(state);
});

export default app; 