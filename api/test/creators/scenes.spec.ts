import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { SceneService } from '../../src/services/scenes';
import { create_database, create_test_user, create_test_adventure, make_request } from '../utils';
import { scenes } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('scenes', async () => {
    describe('api', async () => {
        it('should create a scene', async () => {
            await create_test_user('123', 'test', 'test@test.com');
            const adventure = await create_test_adventure('123', {
                title: 'Test Adventure',
                description: 'Test Description'
            });

            const response = await make_request('scenes', `/${adventure.id}`, {
                method: 'POST',
                userId: '123',
                username: 'test',
                email: 'test@test.com',
                body: {
                    title: 'Opening Scene',
                    content: 'You wake up in a mysterious room...',
                    isStartScene: true,
                    order: 0
                }
            });

            const body = await response.json() as any;
            expect(response.status).toBe(201);
            expect(body).toEqual({
                id: expect.any(String),
                adventureId: adventure.id,
                title: 'Opening Scene',
                content: 'You wake up in a mysterious room...',
                imageUrl: null,
                isStartScene: true,
                order: 0,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });

            const db = create_database();
            const scene = await db.select().from(scenes).where(eq(scenes.id, body.id)).get();
            expect(scene).toEqual({
                id: expect.any(String),
                adventureId: adventure.id,
                title: 'Opening Scene',
                content: 'You wake up in a mysterious room...',
                imageUrl: null,
                isStartScene: true,
                order: 0,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });
        });

        it('should get all scenes for an adventure', async () => {
            await create_test_user('456', 'test2', 'test2@test.com');
            const adventure = await create_test_adventure('456', {
                title: 'Multi-Scene Adventure',
                description: 'Testing multiple scenes'
            });

            const service = new SceneService(env.DB);
            await service.createScene(adventure.id, {
                title: 'Scene 1',
                content: 'First scene content',
                order: 0,
                isStartScene: true
            });
            await service.createScene(adventure.id, {
                title: 'Scene 2',
                content: 'Second scene content',
                order: 1
            });

            const response = await make_request('scenes', `/${adventure.id}`, {
                userId: '456',
                username: 'test2',
                email: 'test2@test.com'
            });

            const body = await response.json() as any[];
            expect(response.status).toBe(200);
            expect(body).toHaveLength(2);
            expect(body[0]).toMatchObject({
                title: 'Scene 1',
                content: 'First scene content',
                order: 0,
                isStartScene: true
            });
            expect(body[1]).toMatchObject({
                title: 'Scene 2',
                content: 'Second scene content',
                order: 1,
                isStartScene: false
            });
        });

        it('should get a specific scene', async () => {
            await create_test_user('789', 'test3', 'test3@test.com');
            const adventure = await create_test_adventure('789', {
                title: 'Single Scene Adventure',
                description: 'Testing single scene'
            });

            const service = new SceneService(env.DB);
            const scene = await service.createScene(adventure.id, {
                title: 'Test Scene',
                content: 'Scene content',
                order: 0
            });

            const response = await make_request('scenes', `/${adventure.id}/${scene.id}`, {
                userId: '789',
                username: 'test3',
                email: 'test3@test.com'
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body).toMatchObject({
                id: scene.id,
                title: 'Test Scene',
                content: 'Scene content',
                order: 0
            });
        });

        it('should update a scene', async () => {
            await create_test_user('101', 'test4', 'test4@test.com');
            const adventure = await create_test_adventure('101', {
                title: 'Update Scene Adventure',
                description: 'Testing scene updates'
            });

            const service = new SceneService(env.DB);
            const scene = await service.createScene(adventure.id, {
                title: 'Original Title',
                content: 'Original content',
                order: 0
            });

            const response = await make_request('scenes', `/${adventure.id}/${scene.id}`, {
                method: 'PUT',
                userId: '101',
                username: 'test4',
                email: 'test4@test.com',
                body: {
                    title: 'Updated Title',
                    content: 'Updated content',
                    order: 1,
                    isStartScene: true
                }
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body).toMatchObject({
                id: scene.id,
                title: 'Updated Title',
                content: 'Updated content',
                order: 1,
                isStartScene: true
            });
        });

        it('should delete a scene with progression redirect', async () => {
            await create_test_user('102', 'test5', 'test5@test.com');
            const adventure = await create_test_adventure('102', {
                title: 'Delete Scene Adventure',
                description: 'Testing scene deletion'
            });

            const service = new SceneService(env.DB);
            const sceneToDelete = await service.createScene(adventure.id, {
                title: 'To Be Deleted',
                content: 'This scene will be deleted',
                order: 0
            });
            const redirectScene = await service.createScene(adventure.id, {
                title: 'Redirect Scene',
                content: 'Redirect here',
                order: 1
            });

            const response = await make_request('scenes', `/${adventure.id}/${sceneToDelete.id}`, {
                method: 'DELETE',
                userId: '102',
                username: 'test5',
                email: 'test5@test.com',
                body: {
                    redirectProgressionToSceneId: redirectScene.id
                }
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.details.deletedScene.id).toBe(sceneToDelete.id);
            expect(body.details.redirectedTo.id).toBe(redirectScene.id);

            const db = create_database();
            const deletedScene = await db.select().from(scenes).where(eq(scenes.id, sceneToDelete.id)).get();
            expect(deletedScene).toBeUndefined();
        });

        // Edge cases
        it('should prevent deleting start scene without changing it first', async () => {
            await create_test_user('103', 'test6', 'test6@test.com');
            const adventure = await create_test_adventure('103', {
                title: 'Start Scene Adventure',
                description: 'Testing start scene protection'
            });

            const service = new SceneService(env.DB);
            const startScene = await service.createScene(adventure.id, {
                title: 'Start Scene',
                content: 'This is the start',
                order: 0,
                isStartScene: true
            });
            const otherScene = await service.createScene(adventure.id, {
                title: 'Other Scene',
                content: 'Another scene',
                order: 1
            });

            const response = await make_request('scenes', `/${adventure.id}/${startScene.id}`, {
                method: 'DELETE',
                userId: '103',
                username: 'test6',
                email: 'test6@test.com',
                body: {
                    redirectProgressionToSceneId: otherScene.id
                }
            });

            expect(response.status).toBe(400);
            const body = await response.json() as any;
            expect(body.error).toBe('Cannot delete the start scene. Set another scene as the start scene first.');
        });

        it('should return 401 when accessing another user\'s adventure scenes', async () => {
            await create_test_user('user1', 'owner', 'owner@test.com');
            await create_test_user('user2', 'other', 'other@test.com');

            const adventure = await create_test_adventure('user1', {
                title: 'Private Adventure',
                description: 'Not for others'
            });

            const service = new SceneService(env.DB);
            const scene = await service.createScene(adventure.id, {
                title: 'Private Scene',
                content: 'Secret content',
                order: 0
            });

            const response = await make_request('scenes', `/${adventure.id}/${scene.id}`, {
                userId: 'user2',
                username: 'other',
                email: 'other@test.com'
            });

            expect(response.status).toBe(401);
        });

        it('should return 404 when scene not found', async () => {
            await create_test_user('user3', 'test', 'test@test.com');
            const adventure = await create_test_adventure('user3', {
                title: 'Adventure',
                description: 'Testing not found'
            });

            const response = await make_request('scenes', `/${adventure.id}/nonexistent-id`, {
                userId: 'user3',
                username: 'test',
                email: 'test@test.com'
            });

            expect(response.status).toBe(404);
        });
    });

    describe('services', async () => {
        it('should create a scene', async () => {
            await create_test_user('123', 'test', 'test@test.com');
            const adventure = await create_test_adventure('123', {
                title: 'Test Adventure',
                description: 'Test Description'
            });

            const service = new SceneService(env.DB);
            const scene = await service.createScene(adventure.id, {
                title: 'Test Scene',
                content: 'Test Content',
                order: 0
            });

            expect(scene).toEqual({
                id: expect.any(String),
                adventureId: adventure.id,
                title: 'Test Scene',
                content: 'Test Content',
                imageUrl: null,
                isStartScene: false,
                order: 0,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });
        });

        it('should handle scene deletion with progression updates', async () => {
            await create_test_user('456', 'test2', 'test2@test.com');
            const adventure = await create_test_adventure('456', {
                title: 'Test Adventure',
                description: 'Test Description'
            });

            const service = new SceneService(env.DB);
            const sceneToDelete = await service.createScene(adventure.id, {
                title: 'Delete Me',
                content: 'To be deleted',
                order: 0
            });
            const redirectScene = await service.createScene(adventure.id, {
                title: 'Redirect Here',
                content: 'Safe scene',
                order: 1
            });

            const result = await service.deleteScene(sceneToDelete.id, redirectScene.id);
            expect(result).toBeDefined();
            expect(result?.success).toBe(true);
            expect(result?.details.deletedScene.id).toBe(sceneToDelete.id);
            expect(result?.details.redirectedTo.id).toBe(redirectScene.id);
        });
    });
}); 