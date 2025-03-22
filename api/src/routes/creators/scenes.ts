import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getUserFromContext } from '../../middleware/auth';
import { SceneService } from '../../services/scenes';
import { AdventureService } from '../../services/adventures';
import type { Env } from '../../types';

const router = new Hono<{ Bindings: Env }>();

// Schema for creating/updating a scene
const sceneSchema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1),
    imageUrl: z.string().url().optional().nullable(),
    isStartScene: z.boolean().optional(),
    order: z.number().int().min(0),
});

// Schema for scene deletion with progression update
const sceneDeleteSchema = z.object({
    redirectProgressionToSceneId: z.string().min(1),
});

// Create a new scene
router.post('/:adventureId', zValidator('json', sceneSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('adventureId');
    const data = c.req.valid('json');
    const adventureService = new AdventureService(c.env.DB);
    const sceneService = new SceneService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    const scene = await sceneService.createScene(adventureId, data);
    return c.json(scene, 201);
});

// Get all scenes for an adventure
router.get('/:adventureId', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('adventureId');
    const adventureService = new AdventureService(c.env.DB);
    const sceneService = new SceneService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    const adventureScenes = await sceneService.getAdventureScenes(adventureId);
    return c.json(adventureScenes);
});

// Get a specific scene
router.get('/:adventureId/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('adventureId');
    const sceneId = c.req.param('id');
    const adventureService = new AdventureService(c.env.DB);
    const sceneService = new SceneService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    const scene = await sceneService.getScene(sceneId, adventureId);
    if (!scene) return c.json({ error: 'Scene not found' }, 404);

    return c.json(scene);
});

// Update a scene
router.put('/:adventureId/:id', zValidator('json', sceneSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('adventureId');
    const sceneId = c.req.param('id');
    const data = c.req.valid('json');
    const adventureService = new AdventureService(c.env.DB);
    const sceneService = new SceneService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    const scene = await sceneService.getScene(sceneId, adventureId);
    if (!scene) return c.json({ error: 'Scene not found' }, 404);

    const updatedScene = await sceneService.updateScene(sceneId, data);
    if (!updatedScene) return c.json({ error: 'Scene not found' }, 404);

    return c.json(updatedScene);
});

// Delete a scene
router.delete('/:adventureId/:id', zValidator('json', sceneDeleteSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('adventureId');
    const sceneId = c.req.param('id');
    const { redirectProgressionToSceneId } = c.req.valid('json');
    const adventureService = new AdventureService(c.env.DB);
    const sceneService = new SceneService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    try {
        const result = await sceneService.deleteScene(sceneId, redirectProgressionToSceneId);
        if (!result) return c.json({ error: 'Scene not found' }, 404);
        return c.json(result);
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'An unknown error occurred' }, 500);
    }
});

export default router; 