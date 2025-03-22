import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getUserFromContext } from '../../middleware/auth';
import { ChoiceService } from '../../services/choices';
import { AdventureService } from '../../services/adventures';
import { SceneService } from '../../services/scenes';
import type { Env } from '../../types';

const router = new Hono<{ Bindings: Env }>();

// Schema for creating/updating a choice
const choiceSchema = z.object({
    text: z.string().min(1).max(500),
    toSceneId: z.string().min(1),
    imageUrl: z.string().url().optional().nullable(),
    condition: z.string().optional(),
    order: z.number().int().min(0),
});

// Create a new choice
router.post('/:adventureId/:fromSceneId', zValidator('json', choiceSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('adventureId');
    const fromSceneId = c.req.param('fromSceneId');
    const data = c.req.valid('json');
    const adventureService = new AdventureService(c.env.DB);
    const sceneService = new SceneService(c.env.DB);
    const choiceService = new ChoiceService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    // Verify both scenes exist and belong to the adventure
    const fromScene = await sceneService.getScene(fromSceneId, adventureId);
    const toScene = await sceneService.getScene(data.toSceneId, adventureId);

    if (!fromScene || !toScene) return c.json({ error: 'Scene not found' }, 404);

    const choice = await choiceService.createChoice(fromSceneId, data);
    return c.json(choice, 201);
});

// Get all choices for a scene
router.get('/:adventureId/:fromSceneId', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('adventureId');
    const fromSceneId = c.req.param('fromSceneId');
    const adventureService = new AdventureService(c.env.DB);
    const sceneService = new SceneService(c.env.DB);
    const choiceService = new ChoiceService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    // Verify scene exists and belongs to the adventure
    const scene = await sceneService.getScene(fromSceneId, adventureId);
    if (!scene) return c.json({ error: 'Scene not found' }, 404);

    const sceneChoices = await choiceService.getSceneChoices(fromSceneId);
    return c.json(sceneChoices);
});

// Get a specific choice
router.get('/:adventureId/:fromSceneId/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('adventureId');
    const fromSceneId = c.req.param('fromSceneId');
    const choiceId = c.req.param('id');
    const adventureService = new AdventureService(c.env.DB);
    const sceneService = new SceneService(c.env.DB);
    const choiceService = new ChoiceService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    // Verify scene exists and belongs to the adventure
    const scene = await sceneService.getScene(fromSceneId, adventureId);
    if (!scene) return c.json({ error: 'Scene not found' }, 404);

    const choice = await choiceService.getChoice(choiceId, fromSceneId);
    if (!choice) return c.json({ error: 'Choice not found' }, 404);

    return c.json(choice);
});

// Update a choice
router.put('/:adventureId/:fromSceneId/:id', zValidator('json', choiceSchema), async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('adventureId');
    const fromSceneId = c.req.param('fromSceneId');
    const choiceId = c.req.param('id');
    const data = c.req.valid('json');
    const adventureService = new AdventureService(c.env.DB);
    const sceneService = new SceneService(c.env.DB);
    const choiceService = new ChoiceService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    // Verify scenes exist and belong to the adventure
    const fromScene = await sceneService.getScene(fromSceneId, adventureId);
    const toScene = await sceneService.getScene(data.toSceneId, adventureId);

    if (!fromScene || !toScene) return c.json({ error: 'Scene not found' }, 404);

    const choice = await choiceService.getChoice(choiceId, fromSceneId);
    if (!choice) return c.json({ error: 'Choice not found' }, 404);

    const updatedChoice = await choiceService.updateChoice(choiceId, data);
    if (!updatedChoice) return c.json({ error: 'Choice not found' }, 404);

    return c.json(updatedChoice);
});

// Delete a choice
router.delete('/:adventureId/:fromSceneId/:id', async (c) => {
    const userId = await getUserFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const adventureId = c.req.param('adventureId');
    const fromSceneId = c.req.param('fromSceneId');
    const choiceId = c.req.param('id');
    const adventureService = new AdventureService(c.env.DB);
    const sceneService = new SceneService(c.env.DB);
    const choiceService = new ChoiceService(c.env.DB);

    const isOwner = await adventureService.verifyOwnership(adventureId, userId);
    if (!isOwner) return c.json({ error: 'Unauthorized' }, 401);

    // Verify scene exists and belongs to the adventure
    const scene = await sceneService.getScene(fromSceneId, adventureId);
    if (!scene) return c.json({ error: 'Scene not found' }, 404);

    const choice = await choiceService.getChoice(choiceId, fromSceneId);
    if (!choice) return c.json({ error: 'Choice not found' }, 404);

    await choiceService.deleteChoice(choiceId);
    return c.json({ success: true });
});

export default router; 