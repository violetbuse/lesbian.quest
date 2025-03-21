import { Hono } from 'hono';
import { createDb } from '../db';
import { adventures, scenes } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromContext } from '../middleware/auth';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

// Get all scenes for an adventure
app.get('/adventure/:adventureId', async (c) => {
    const userId = await getUserFromContext(c);
    const adventureId = c.req.param('adventureId');
    const db = createDb(c.env.DB);

    // Check if adventure exists and if user has access
    const adventure = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, adventureId))
        .get();

    if (!adventure) {
        return c.json({ error: 'Adventure not found' }, 404);
    }

    if (!adventure.isPublished && adventure.authorId !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    const allScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.adventureId, adventureId))
        .all();

    return c.json(allScenes);
});

// Get a specific scene
app.get('/:id', async (c) => {
    const userId = await getUserFromContext(c);
    const sceneId = c.req.param('id');
    const db = createDb(c.env.DB);

    const scene = await db
        .select()
        .from(scenes)
        .where(eq(scenes.id, sceneId))
        .get();

    if (!scene) {
        return c.json({ error: 'Scene not found' }, 404);
    }

    // Check if user has access to the adventure
    const adventure = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, scene.adventureId))
        .get();

    if (!adventure) {
        return c.json({ error: 'Adventure not found' }, 404);
    }

    if (!adventure.isPublished && adventure.authorId !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json(scene);
});

// Create a new scene
app.post('/', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const db = createDb(c.env.DB);

    // Check if user owns the adventure
    const adventure = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, body.adventureId))
        .get();

    if (!adventure || adventure.authorId !== userId) {
        return c.json({ error: 'Adventure not found' }, 404);
    }

    const scene = await db
        .insert(scenes)
        .values({
            id: crypto.randomUUID(),
            adventureId: body.adventureId,
            title: body.title,
            content: body.content || '',
            isStartScene: body.isStartScene || false,
            order: body.order || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning()
        .get();

    return c.json(scene);
});

// Update a scene
app.put('/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const sceneId = c.req.param('id');
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    // Check if scene exists
    const existing = await db
        .select()
        .from(scenes)
        .where(eq(scenes.id, sceneId))
        .get();

    if (!existing) {
        return c.json({ error: 'Scene not found' }, 404);
    }

    // Check if user owns the adventure
    const adventure = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, existing.adventureId))
        .get();

    if (!adventure || adventure.authorId !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    const scene = await db
        .update(scenes)
        .set({
            title: body.title,
            content: body.content,
            isStartScene: body.isStartScene,
            order: body.order,
            updatedAt: new Date(),
        })
        .where(eq(scenes.id, sceneId))
        .returning()
        .get();

    return c.json(scene);
});

// Delete a scene
app.delete('/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const sceneId = c.req.param('id');
    const db = createDb(c.env.DB);

    // Check if scene exists
    const existing = await db
        .select()
        .from(scenes)
        .where(eq(scenes.id, sceneId))
        .get();

    if (!existing) {
        return c.json({ error: 'Scene not found' }, 404);
    }

    // Check if user owns the adventure
    const adventure = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, existing.adventureId))
        .get();

    if (!adventure || adventure.authorId !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    await db
        .delete(scenes)
        .where(eq(scenes.id, sceneId));

    return c.json({ success: true });
});

export default app; 