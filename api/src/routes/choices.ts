import { Hono } from 'hono';
import { createDb } from '../db';
import { adventures, scenes, choices } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromContext } from '../middleware/auth';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

// Get all choices for a scene
app.get('/scene/:sceneId', async (c) => {
    const userId = await getUserFromContext(c);
    const sceneId = c.req.param('sceneId');
    const db = createDb(c.env.DB);

    // Check if scene exists
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

    const allChoices = await db
        .select()
        .from(choices)
        .where(eq(choices.fromSceneId, sceneId))
        .all();

    return c.json(allChoices);
});

// Create a new choice
app.post('/', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const db = createDb(c.env.DB);

    // Check if both scenes exist and belong to the same adventure
    const fromScene = await db
        .select()
        .from(scenes)
        .where(eq(scenes.id, body.fromSceneId))
        .get();

    const toScene = await db
        .select()
        .from(scenes)
        .where(eq(scenes.id, body.toSceneId))
        .get();

    if (!fromScene || !toScene) {
        return c.json({ error: 'Scene not found' }, 404);
    }

    if (fromScene.adventureId !== toScene.adventureId) {
        return c.json({ error: 'Scenes must belong to the same adventure' }, 400);
    }

    // Check if user owns the adventure
    const adventure = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, fromScene.adventureId))
        .get();

    if (!adventure || adventure.authorId !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    // Get the current highest order for choices in this scene
    const highestOrder = await db
        .select({ order: choices.order })
        .from(choices)
        .where(eq(choices.fromSceneId, body.fromSceneId))
        .orderBy(choices.order)
        .get();

    const nextOrder = (highestOrder?.order ?? -1) + 1;

    const choice = await db
        .insert(choices)
        .values({
            id: crypto.randomUUID(),
            fromSceneId: body.fromSceneId,
            toSceneId: body.toSceneId,
            text: body.text,
            order: nextOrder,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning()
        .get();

    return c.json(choice);
});

// Update a choice
app.put('/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const choiceId = c.req.param('id');
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    // Check if choice exists
    const existing = await db
        .select()
        .from(choices)
        .where(eq(choices.id, choiceId))
        .get();

    if (!existing) {
        return c.json({ error: 'Choice not found' }, 404);
    }

    // Get the scene and check if user owns the adventure
    const scene = await db
        .select()
        .from(scenes)
        .where(eq(scenes.id, existing.fromSceneId))
        .get();

    if (!scene) {
        return c.json({ error: 'Scene not found' }, 404);
    }

    const adventure = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, scene.adventureId))
        .get();

    if (!adventure || adventure.authorId !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    const choice = await db
        .update(choices)
        .set({
            text: body.text,
            order: body.order ?? existing.order,
            updatedAt: new Date(),
        })
        .where(eq(choices.id, choiceId))
        .returning()
        .get();

    return c.json(choice);
});

// Delete a choice
app.delete('/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const choiceId = c.req.param('id');
    const db = createDb(c.env.DB);

    // Check if choice exists
    const existing = await db
        .select()
        .from(choices)
        .where(eq(choices.id, choiceId))
        .get();

    if (!existing) {
        return c.json({ error: 'Choice not found' }, 404);
    }

    // Get the scene and check if user owns the adventure
    const scene = await db
        .select()
        .from(scenes)
        .where(eq(scenes.id, existing.fromSceneId))
        .get();

    if (!scene) {
        return c.json({ error: 'Scene not found' }, 404);
    }

    const adventure = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, scene.adventureId))
        .get();

    if (!adventure || adventure.authorId !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    await db
        .delete(choices)
        .where(eq(choices.id, choiceId));

    return c.json({ success: true });
});

export default app; 