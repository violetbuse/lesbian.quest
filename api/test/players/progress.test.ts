import { describe, it, expect, beforeEach } from 'vitest';
import {
    create_test_user,
    create_test_adventure,
    create_test_scene,
    create_test_choice,
    create_test_progress,
    make_progress_request,
} from '../utils';

interface Scene {
    id: string;
    title: string;
    content: string;
    isStartScene: boolean;
    order: number;
    adventureId: string;
    imageUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

interface Progress {
    id: string;
    userId: string;
    adventureId: string;
    currentSceneId: string;
    variables: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    currentScene: Scene;
}

describe('Progress API', () => {
    const TEST_USER = {
        id: 'test-user',
        username: 'test',
        email: 'test@test.com',
    };

    const TEST_ADVENTURE = {
        title: 'Test Adventure',
        description: 'A test adventure',
        isPublished: true,
    };

    beforeEach(async () => {
        await create_test_user(TEST_USER.id, TEST_USER.username, TEST_USER.email);
    });

    describe('GET /api/players/progress/:adventureId', () => {
        it('should return 404 when progress does not exist', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const response = await make_progress_request(`/${adventure.id}`);
            expect(response.status).toBe(404);
            expect(await response.json()).toEqual({ error: 'Progress not found' });
        });

        it('should return progress when it exists', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const scene = await create_test_scene(adventure.id, {
                title: 'Start Scene',
                content: 'Welcome to the adventure!',
                isStartScene: true,
                order: 1,
            });

            const progress = await create_test_progress(TEST_USER.id, {
                adventureId: adventure.id,
                currentSceneId: scene.id,
                variables: { health: 100 },
            });

            const response = await make_progress_request(`/${adventure.id}`);
            expect(response.status).toBe(200);
            const data = await response.json();

            expect(progress).not.toBeNull();
            if (!progress) throw new Error('Progress should not be null');
            const typedProgress = progress as Progress;

            expect(data).toMatchObject({
                id: typedProgress.id,
                userId: typedProgress.userId,
                adventureId: typedProgress.adventureId,
                currentSceneId: typedProgress.currentSceneId,
                variables: typedProgress.variables,
                currentScene: {
                    id: typedProgress.currentScene.id,
                    title: typedProgress.currentScene.title,
                    content: typedProgress.currentScene.content,
                    isStartScene: typedProgress.currentScene.isStartScene,
                    order: typedProgress.currentScene.order,
                    adventureId: typedProgress.currentScene.adventureId,
                    imageUrl: typedProgress.currentScene.imageUrl,
                    createdAt: null,
                    updatedAt: null,
                }
            });
        });
    });

    describe('POST /api/players/progress', () => {
        it('should create new progress', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const scene = await create_test_scene(adventure.id, {
                title: 'Start Scene',
                content: 'Welcome to the adventure!',
                isStartScene: true,
                order: 1,
            });

            const response = await make_progress_request('', {
                method: 'POST',
                body: {
                    adventureId: adventure.id,
                    currentSceneId: scene.id,
                    variables: { health: 100 },
                },
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data).toMatchObject({
                userId: TEST_USER.id,
                adventureId: adventure.id,
                currentSceneId: scene.id,
                variables: { health: 100 },
            });
        });

        it('should return 401 when not authenticated', async () => {
            const response = await make_progress_request('', {
                method: 'POST',
                userId: 'invalid-user',
                authenticated: false,
                body: {
                    adventureId: 'test-adventure',
                    currentSceneId: 'test-scene',
                    variables: {},
                },
            });

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });
    });

    describe('PATCH /api/players/progress/:adventureId', () => {
        it('should update existing progress', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const scene1 = await create_test_scene(adventure.id, {
                title: 'Scene 1',
                content: 'First scene',
                isStartScene: true,
                order: 1,
            });
            const scene2 = await create_test_scene(adventure.id, {
                title: 'Scene 2',
                content: 'Second scene',
                order: 2,
            });

            await create_test_progress(TEST_USER.id, {
                adventureId: adventure.id,
                currentSceneId: scene1.id,
                variables: { health: 100 },
            });

            const response = await make_progress_request(`/${adventure.id}`, {
                method: 'PATCH',
                body: {
                    currentSceneId: scene2.id,
                    variables: { health: 80 },
                },
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toMatchObject({
                userId: TEST_USER.id,
                adventureId: adventure.id,
                currentSceneId: scene2.id,
                variables: { health: 80 },
            });
        });

        it('should return 404 when progress does not exist', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const response = await make_progress_request(`/${adventure.id}`, {
                method: 'PATCH',
                body: {
                    variables: { health: 80 },
                },
            });

            expect(response.status).toBe(404);
            expect(await response.json()).toEqual({ error: 'Progress not found' });
        });
    });

    describe('DELETE /api/players/progress/:adventureId', () => {
        it('should delete existing progress', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const scene = await create_test_scene(adventure.id, {
                title: 'Start Scene',
                content: 'Welcome to the adventure!',
                isStartScene: true,
                order: 1,
            });

            await create_test_progress(TEST_USER.id, {
                adventureId: adventure.id,
                currentSceneId: scene.id,
                variables: { health: 100 },
            });

            const response = await make_progress_request(`/${adventure.id}`, {
                method: 'DELETE',
            });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true });

            // Verify progress is deleted
            const getResponse = await make_progress_request(`/${adventure.id}`);
            expect(getResponse.status).toBe(404);
        });

        it('should return 404 when progress does not exist', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const response = await make_progress_request(`/${adventure.id}`, {
                method: 'DELETE',
            });

            expect(response.status).toBe(404);
            expect(await response.json()).toEqual({ error: 'Progress not found' });
        });
    });
}); 