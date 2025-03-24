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

    const OTHER_USER = {
        id: 'other-user',
        username: 'other',
        email: 'other@test.com',
    };

    const TEST_ADVENTURE = {
        title: 'Test Adventure',
        description: 'A test adventure',
        isPublished: true,
    };

    beforeEach(async () => {
        await create_test_user(TEST_USER.id, TEST_USER.username, TEST_USER.email);
        await create_test_user(OTHER_USER.id, OTHER_USER.username, OTHER_USER.email);
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

    describe('Interactions with other users\' adventures', () => {
        it('should allow liking adventures created by other users', async () => {
            const otherUserAdventure = await create_test_adventure(OTHER_USER.id, TEST_ADVENTURE);
            const response = await make_interactions_request(`/${otherUserAdventure.id}/like`, {
                method: 'POST',
            });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true });
        });

        it('should allow saving adventures created by other users', async () => {
            const otherUserAdventure = await create_test_adventure(OTHER_USER.id, TEST_ADVENTURE);
            const response = await make_interactions_request(`/${otherUserAdventure.id}/save`, {
                method: 'POST',
            });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true });
        });

        it('should allow favoriting adventures created by other users', async () => {
            const otherUserAdventure = await create_test_adventure(OTHER_USER.id, TEST_ADVENTURE);
            const response = await make_interactions_request(`/${otherUserAdventure.id}/favorite`, {
                method: 'POST',
            });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true });
        });

        it('should include other users\' adventures in interactions list', async () => {
            const otherUserAdventure = await create_test_adventure(OTHER_USER.id, TEST_ADVENTURE);

            // Add interactions with other user's adventure
            await make_interactions_request(`/${otherUserAdventure.id}/like`, {
                method: 'POST',
            });
            await make_interactions_request(`/${otherUserAdventure.id}/save`, {
                method: 'POST',
            });
            await make_interactions_request(`/${otherUserAdventure.id}/favorite`, {
                method: 'POST',
            });

            const response = await make_interactions_request('/interactions');
            expect(response.status).toBe(200);
            const data = await response.json() as { favorites: any[], likes: any[], saves: any[], played: any[] };

            expect(data.likes).toHaveLength(1);
            expect(data.saves).toHaveLength(1);
            expect(data.favorites).toHaveLength(1);

            // Verify the adventure details are correct
            expect(data.likes[0]).toEqual({
                id: otherUserAdventure.id,
                title: otherUserAdventure.title,
                description: otherUserAdventure.description,
                isPublished: otherUserAdventure.isPublished,
                authorId: otherUserAdventure.authorId,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });
    });

    describe('GET /api/players/adventures/:adventureId/state', () => {
        it('should return 401 when not authenticated', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const response = await make_interactions_request(`/${adventure.id}/state`, {
                authenticated: false,
            });

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });

        it('should return all false when no interactions exist', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const response = await make_interactions_request(`/${adventure.id}/state`);

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                isFavorited: false,
                isLiked: false,
                isSaved: false,
                isPlayed: false,
            });
        });

        it('should return correct state when adventure is favorited', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // Favorite the adventure
            await make_interactions_request(`/${adventure.id}/favorite`, {
                method: 'POST',
            });

            const response = await make_interactions_request(`/${adventure.id}/state`);
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                isFavorited: true,
                isLiked: false,
                isSaved: false,
                isPlayed: false,
            });
        });

        it('should return correct state when adventure is liked', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // Like the adventure
            await make_interactions_request(`/${adventure.id}/like`, {
                method: 'POST',
            });

            const response = await make_interactions_request(`/${adventure.id}/state`);
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                isFavorited: false,
                isLiked: true,
                isSaved: false,
                isPlayed: false,
            });
        });

        it('should return correct state when adventure is saved', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // Save the adventure
            await make_interactions_request(`/${adventure.id}/save`, {
                method: 'POST',
            });

            const response = await make_interactions_request(`/${adventure.id}/state`);
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                isFavorited: false,
                isLiked: false,
                isSaved: true,
                isPlayed: false,
            });
        });

        it('should return correct state when adventure is played', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const scene = await create_test_scene(adventure.id, {
                title: 'Start Scene',
                content: 'Welcome to the adventure!',
                isStartScene: true,
                order: 1,
            });

            // Create progress for the adventure
            await create_test_progress(TEST_USER.id, {
                adventureId: adventure.id,
                currentSceneId: scene.id,
                variables: {},
            });

            const response = await make_interactions_request(`/${adventure.id}/state`);
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                isFavorited: false,
                isLiked: false,
                isSaved: false,
                isPlayed: true,
            });
        });

        it('should return correct state when adventure has multiple interactions', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);
            const scene = await create_test_scene(adventure.id, {
                title: 'Start Scene',
                content: 'Welcome to the adventure!',
                isStartScene: true,
                order: 1,
            });

            // Add all interactions
            await Promise.all([
                make_interactions_request(`/${adventure.id}/favorite`, { method: 'POST' }),
                make_interactions_request(`/${adventure.id}/like`, { method: 'POST' }),
                make_interactions_request(`/${adventure.id}/save`, { method: 'POST' }),
                create_test_progress(TEST_USER.id, {
                    adventureId: adventure.id,
                    currentSceneId: scene.id,
                    variables: {},
                }),
            ]);

            const response = await make_interactions_request(`/${adventure.id}/state`);
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                isFavorited: true,
                isLiked: true,
                isSaved: true,
                isPlayed: true,
            });
        });

        it('should return correct state after removing interactions', async () => {
            const adventure = await create_test_adventure(TEST_USER.id, TEST_ADVENTURE);

            // Add all interactions
            await Promise.all([
                make_interactions_request(`/${adventure.id}/favorite`, { method: 'POST' }),
                make_interactions_request(`/${adventure.id}/like`, { method: 'POST' }),
                make_interactions_request(`/${adventure.id}/save`, { method: 'POST' }),
            ]);

            // Remove some interactions
            await Promise.all([
                make_interactions_request(`/${adventure.id}/favorite`, { method: 'DELETE' }),
                make_interactions_request(`/${adventure.id}/like`, { method: 'DELETE' }),
            ]);

            const response = await make_interactions_request(`/${adventure.id}/state`);
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                isFavorited: false,
                isLiked: false,
                isSaved: true,
                isPlayed: false,
            });
        });

        it('should return correct state for non-existent adventure', async () => {
            const response = await make_interactions_request('/non-existent-id/state');
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                isFavorited: false,
                isLiked: false,
                isSaved: false,
                isPlayed: false,
            });
        });

        it('should return correct state for other user\'s adventure', async () => {
            const otherUserAdventure = await create_test_adventure(OTHER_USER.id, TEST_ADVENTURE);

            // Add interactions with other user's adventure
            await make_interactions_request(`/${otherUserAdventure.id}/like`, {
                method: 'POST',
            });
            await make_interactions_request(`/${otherUserAdventure.id}/save`, {
                method: 'POST',
            });

            const response = await make_interactions_request(`/${otherUserAdventure.id}/state`);
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                isFavorited: false,
                isLiked: true,
                isSaved: true,
                isPlayed: false,
            });
        });
    });
}); 