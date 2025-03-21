import { Hono } from 'hono';
import { createDb } from '../db';
import { adventures, scenes, playerProgress } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromContext } from '../middleware/auth';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

// Get progress for an adventure
app.get('/adventure/:adventureId', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const adventureId = c.req.param('adventureId');
    const db = createDb(c.env.DB);

    // Check if adventure exists
    const adventure = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, adventureId))
        .get();

    if (!adventure) {
        return c.json({ error: 'Adventure not found' }, 404);
    }

    const progress = await db
        .select()
        .from(playerProgress)
        .where(and(
            eq(playerProgress.userId, userId),
            eq(playerProgress.adventureId, adventureId)
        ))
        .get();

    return c.json(progress || { currentSceneId: null, variables: {} });
});

// Save progress
app.post('/', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const db = createDb(c.env.DB);

    // Check if adventure exists
    const adventure = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, body.adventureId))
        .get();

    if (!adventure) {
        return c.json({ error: 'Adventure not found' }, 404);
    }

    // Check if scene exists and belongs to the adventure
    const scene = await db
        .select()
        .from(scenes)
        .where(and(
            eq(scenes.id, body.sceneId),
            eq(scenes.adventureId, body.adventureId)
        ))
        .get();

    if (!scene) {
        return c.json({ error: 'Scene not found' }, 404);
    }

    // Check if progress exists
    const existing = await db
        .select()
        .from(playerProgress)
        .where(and(
            eq(playerProgress.userId, userId),
            eq(playerProgress.adventureId, body.adventureId)
        ))
        .get();

    let progress;
    if (existing) {
        // Update existing progress
        progress = await db
            .update(playerProgress)
            .set({
                currentSceneId: body.sceneId,
                variables: body.variables || existing.variables,
                updatedAt: new Date(),
            })
            .where(and(
                eq(playerProgress.userId, userId),
                eq(playerProgress.adventureId, body.adventureId)
            ))
            .returning()
            .get();
    } else {
        // Create new progress
        progress = await db
            .insert(playerProgress)
            .values({
                id: crypto.randomUUID(),
                userId,
                adventureId: body.adventureId,
                currentSceneId: body.sceneId,
                variables: body.variables || {},
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning()
            .get();
    }

    return c.json(progress);
});

export default app; 