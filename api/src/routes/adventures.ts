import { Hono } from 'hono';
import { createDb } from '../db';
import { adventures } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getUserFromContext } from '../middleware/auth';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

// Get all adventures (published ones for everyone, unpublished only for the author)
app.get('/', async (c) => {
    const userId = await getUserFromContext(c);
    const db = createDb(c.env.DB);

    const allAdventures = await db
        .select()
        .from(adventures)
        .where(userId ? undefined : eq(adventures.isPublished, true))
        .all();

    return c.json(allAdventures);
});

// Get a specific adventure
app.get('/:id', async (c) => {
    const userId = await getUserFromContext(c);
    const adventureId = c.req.param('id');
    const db = createDb(c.env.DB);

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

    return c.json(adventure);
});

// Create a new adventure
app.post('/', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const adventure = await db
        .insert(adventures)
        .values({
            id: crypto.randomUUID(),
            title: body.title,
            description: body.description || '',
            authorId: userId,
            isPublished: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning()
        .get();

    return c.json(adventure);
});

// Update an adventure
app.put('/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const adventureId = c.req.param('id');
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const existing = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, adventureId))
        .get();

    if (!existing) {
        return c.json({ error: 'Adventure not found' }, 404);
    }

    if (existing.authorId !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    const adventure = await db
        .update(adventures)
        .set({
            title: body.title,
            description: body.description,
            isPublished: body.isPublished,
            updatedAt: new Date(),
        })
        .where(eq(adventures.id, adventureId))
        .returning()
        .get();

    return c.json(adventure);
});

// Delete an adventure
app.delete('/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const adventureId = c.req.param('id');
    const db = createDb(c.env.DB);

    const existing = await db
        .select()
        .from(adventures)
        .where(eq(adventures.id, adventureId))
        .get();

    if (!existing) {
        return c.json({ error: 'Adventure not found' }, 404);
    }

    if (existing.authorId !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    await db
        .delete(adventures)
        .where(eq(adventures.id, adventureId));

    return c.json({ success: true });
});

export default app; 