import { describe, it, expect, beforeEach } from 'vitest';
import {
    create_test_user,
    create_test_adventure,
    create_test_scene,
    create_test_choice,
    create_test_progress,
    make_interactions_request,
} from '../utils';

describe('Interactions API', () => {
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

    describe('POST /api/players/adventures/:adventureId/favorite', () => {
        it('should add an adventure to favorites', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const response = await make_interactions_request(`/${adventure.id}/favorite`, {
                method: 'POST',
            });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true });
        });

        it('should return 400 when already favorited', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // First favorite
            await make_interactions_request(`/${adventure.id}/favorite`, {
                method: 'POST',
            });

            // Try to favorite again
            const response = await make_interactions_request(`/${adventure.id}/favorite`, {
                method: 'POST',
            });

            expect(response.status).toBe(400);
            expect(await response.json()).toEqual({ error: 'Already favorited' });
        });

        it('should return 401 when not authenticated', async () => {
            const response = await make_interactions_request('/test-adventure/favorite', {
                method: 'POST',
                authenticated: false,
            });

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });
    });

    describe('DELETE /api/players/adventures/:adventureId/favorite', () => {
        it('should remove an adventure from favorites', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // First favorite
            await make_interactions_request(`/${adventure.id}/favorite`, {
                method: 'POST',
            });

            // Then remove from favorites
            const response = await make_interactions_request(`/${adventure.id}/favorite`, {
                method: 'DELETE',
            });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true });
        });

        it('should return 401 when not authenticated', async () => {
            const response = await make_interactions_request('/test-adventure/favorite', {
                method: 'DELETE',
                authenticated: false,
            });

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });
    });

    describe('POST /api/players/adventures/:adventureId/like', () => {
        it('should like an adventure', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const response = await make_interactions_request(`/${adventure.id}/like`, {
                method: 'POST',
            });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true });
        });

        it('should return 400 when already liked', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // First like
            await make_interactions_request(`/${adventure.id}/like`, {
                method: 'POST',
            });

            // Try to like again
            const response = await make_interactions_request(`/${adventure.id}/like`, {
                method: 'POST',
            });

            expect(response.status).toBe(400);
            expect(await response.json()).toEqual({ error: 'Already liked' });
        });

        it('should return 401 when not authenticated', async () => {
            const response = await make_interactions_request('/test-adventure/like', {
                method: 'POST',
                authenticated: false,
            });

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });
    });

    describe('DELETE /api/players/adventures/:adventureId/like', () => {
        it('should unlike an adventure', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // First like
            await make_interactions_request(`/${adventure.id}/like`, {
                method: 'POST',
            });

            // Then unlike
            const response = await make_interactions_request(`/${adventure.id}/like`, {
                method: 'DELETE',
            });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true });
        });

        it('should return 401 when not authenticated', async () => {
            const response = await make_interactions_request('/test-adventure/like', {
                method: 'DELETE',
                authenticated: false,
            });

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });
    });

    describe('POST /api/players/adventures/:adventureId/save', () => {
        it('should save an adventure', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const response = await make_interactions_request(`/${adventure.id}/save`, {
                method: 'POST',
            });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true });
        });

        it('should return 400 when already saved', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // First save
            await make_interactions_request(`/${adventure.id}/save`, {
                method: 'POST',
            });

            // Try to save again
            const response = await make_interactions_request(`/${adventure.id}/save`, {
                method: 'POST',
            });

            expect(response.status).toBe(400);
            expect(await response.json()).toEqual({ error: 'Already saved' });
        });

        it('should return 401 when not authenticated', async () => {
            const response = await make_interactions_request('/test-adventure/save', {
                method: 'POST',
                authenticated: false,
            });

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });
    });

    describe('DELETE /api/players/adventures/:adventureId/save', () => {
        it('should remove an adventure from saves', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // First save
            await make_interactions_request(`/${adventure.id}/save`, {
                method: 'POST',
            });

            // Then remove from saves
            const response = await make_interactions_request(`/${adventure.id}/save`, {
                method: 'DELETE',
            });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true });
        });

        it('should return 401 when not authenticated', async () => {
            const response = await make_interactions_request('/test-adventure/save', {
                method: 'DELETE',
                authenticated: false,
            });

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });
    });

    describe('GET /api/players/adventures/interactions', () => {
        it('should return all user interactions', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // Add interactions
            await make_interactions_request(`/${adventure.id}/favorite`, {
                method: 'POST',
            });
            await make_interactions_request(`/${adventure.id}/like`, {
                method: 'POST',
            });
            await make_interactions_request(`/${adventure.id}/save`, {
                method: 'POST',
            });

            const response = await make_interactions_request('/interactions');
            expect(response.status).toBe(200);
            const data = await response.json() as { favorites: any[], likes: any[], saves: any[], played: any[] };

            expect(data).toEqual({
                favorites: [{
                    id: adventure.id,
                    title: adventure.title,
                    description: adventure.description,
                    isPublished: adventure.isPublished,
                    authorId: adventure.authorId,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                }],
                likes: [{
                    id: adventure.id,
                    title: adventure.title,
                    description: adventure.description,
                    isPublished: adventure.isPublished,
                    authorId: adventure.authorId,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                }],
                saves: [{
                    id: adventure.id,
                    title: adventure.title,
                    description: adventure.description,
                    isPublished: adventure.isPublished,
                    authorId: adventure.authorId,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                }],
                played: [],
            });
        });

        it('should include played adventures in the response', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // Create scenes
            const startScene = await create_test_scene(adventure.id, {
                title: 'Start Scene',
                content: 'Welcome to the adventure!',
                isStartScene: true,
                order: 1,
            });
            const nextScene = await create_test_scene(adventure.id, {
                title: 'Next Scene',
                content: 'You move forward...',
                order: 2,
            });

            // Create a choice between scenes
            await create_test_choice(startScene.id, nextScene.id, {
                text: 'Move forward',
                order: 0,
            });

            // Create progress for the adventure
            await create_test_progress(TEST_USER.id, {
                adventureId: adventure.id,
                currentSceneId: nextScene.id,
                variables: { health: 100 },
            });

            const response = await make_interactions_request('/interactions');
            expect(response.status).toBe(200);
            const data = await response.json() as { favorites: any[], likes: any[], saves: any[], played: any[] };

            expect(data.played).toHaveLength(1);
            expect(data.played[0]).toEqual({
                id: adventure.id,
                title: adventure.title,
                description: adventure.description,
                isPublished: adventure.isPublished,
                authorId: adventure.authorId,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });

        it('should return 401 when not authenticated', async () => {
            const response = await make_interactions_request('/interactions', {
                authenticated: false,
            });

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });
    });
}); 