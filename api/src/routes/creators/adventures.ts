import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getUserFromContext } from '../../middleware/auth';
import { AdventureService } from '../../services/adventures';
import type { Env } from '../../types';

const router = new Hono<{ Bindings: Env }>();

// Schema for creating/updating an adventure
const adventureSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    isPublished: z.boolean().optional(),
});

// Create a new adventure
router.post('/', zValidator('json', adventureSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const data = c.req.valid('json');
    const adventureService = new AdventureService(c.env.DB);

    const adventure = await adventureService.createAdventure(userId, data);
    return c.json(adventure, 201);
});

// Get all adventures for the current user
router.get('/', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureService = new AdventureService(c.env.DB);
    const userAdventures = await adventureService.getUserAdventures(userId);

    return c.json(userAdventures);
});

// Get a specific adventure
router.get('/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('id');
    const adventureService = new AdventureService(c.env.DB);

    const adventure = await adventureService.getAdventure(adventureId);
    if (!adventure) return c.json({ error: 'Adventure not found' }, 404);
    if (adventure.authorId !== userId) return c.json({ error: 'Unauthorized' }, 401);

    return c.json(adventure);
});

// Update an adventure
router.put('/:id', zValidator('json', adventureSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('id');
    const data = c.req.valid('json');
    const adventureService = new AdventureService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    const updatedAdventure = await adventureService.updateAdventure(adventureId, data);
    if (!updatedAdventure) return c.json({ error: 'Adventure not found' }, 404);

    return c.json(updatedAdventure);
});

// Delete an adventure
router.delete('/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('id');
    const adventureService = new AdventureService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    await adventureService.deleteAdventure(adventureId);
    return c.json({ success: true });
});

export default router; 