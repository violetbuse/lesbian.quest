import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { ChoiceService } from '../../src/services/choices';
import { SceneService } from '../../src/services/scenes';
import { create_database, create_test_user, create_test_adventure, make_request } from '../utils';
import { choices } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('choices', async () => {
    describe('api', async () => {
        it('should create a choice', async () => {
            await create_test_user('123', 'test', 'test@test.com');
            const adventure = await create_test_adventure('123', {
                title: 'Test Adventure',
                description: 'Test Description'
            });

            const sceneService = new SceneService(env.DB);
            const fromScene = await sceneService.createScene(adventure.id, {
                title: 'From Scene',
                content: 'Starting point',
                order: 0
            });
            const toScene = await sceneService.createScene(adventure.id, {
                title: 'To Scene',
                content: 'Destination',
                order: 1
            });

            const response = await make_request('choices', `/${adventure.id}/${fromScene.id}`, {
                method: 'POST',
                userId: '123',
                username: 'test',
                email: 'test@test.com',
                body: {
                    text: 'Go to next room',
                    toSceneId: toScene.id,
                    order: 0
                }
            });

            const body = await response.json() as any;
            expect(response.status).toBe(201);
            expect(body).toEqual({
                id: expect.any(String),
                fromSceneId: fromScene.id,
                toSceneId: toScene.id,
                text: 'Go to next room',
                imageUrl: null,
                condition: null,
                order: 0,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });

            const db = create_database();
            const choice = await db.select().from(choices).where(eq(choices.id, body.id)).get();
            expect(choice).toEqual({
                id: expect.any(String),
                fromSceneId: fromScene.id,
                toSceneId: toScene.id,
                text: 'Go to next room',
                imageUrl: null,
                condition: null,
                order: 0,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });
        });

        it('should get all choices for a scene', async () => {
            await create_test_user('456', 'test2', 'test2@test.com');
            const adventure = await create_test_adventure('456', {
                title: 'Multi-Choice Adventure',
                description: 'Testing multiple choices'
            });

            const sceneService = new SceneService(env.DB);
            const fromScene = await sceneService.createScene(adventure.id, {
                title: 'Branching Scene',
                content: 'Make your choice',
                order: 0
            });
            const toScene1 = await sceneService.createScene(adventure.id, {
                title: 'Option 1',
                content: 'First path',
                order: 1
            });
            const toScene2 = await sceneService.createScene(adventure.id, {
                title: 'Option 2',
                content: 'Second path',
                order: 2
            });

            const choiceService = new ChoiceService(env.DB);
            await choiceService.createChoice(fromScene.id, {
                text: 'Take first path',
                toSceneId: toScene1.id,
                order: 0
            });
            await choiceService.createChoice(fromScene.id, {
                text: 'Take second path',
                toSceneId: toScene2.id,
                order: 1
            });

            const response = await make_request('choices', `/${adventure.id}/${fromScene.id}`, {
                userId: '456',
                username: 'test2',
                email: 'test2@test.com'
            });

            const body = await response.json() as any[];
            expect(response.status).toBe(200);
            expect(body).toHaveLength(2);
            expect(body[0]).toMatchObject({
                text: 'Take first path',
                toSceneId: toScene1.id,
                order: 0
            });
            expect(body[1]).toMatchObject({
                text: 'Take second path',
                toSceneId: toScene2.id,
                order: 1
            });
        });

        it('should get a specific choice', async () => {
            await create_test_user('789', 'test3', 'test3@test.com');
            const adventure = await create_test_adventure('789', {
                title: 'Single Choice Adventure',
                description: 'Testing single choice'
            });

            const sceneService = new SceneService(env.DB);
            const fromScene = await sceneService.createScene(adventure.id, {
                title: 'Start',
                content: 'Beginning',
                order: 0
            });
            const toScene = await sceneService.createScene(adventure.id, {
                title: 'End',
                content: 'Ending',
                order: 1
            });

            const choiceService = new ChoiceService(env.DB);
            const choice = await choiceService.createChoice(fromScene.id, {
                text: 'Finish story',
                toSceneId: toScene.id,
                order: 0
            });

            const response = await make_request('choices', `/${adventure.id}/${fromScene.id}/${choice.id}`, {
                userId: '789',
                username: 'test3',
                email: 'test3@test.com'
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body).toMatchObject({
                id: choice.id,
                text: 'Finish story',
                toSceneId: toScene.id,
                order: 0
            });
        });

        it('should update a choice', async () => {
            await create_test_user('101', 'test4', 'test4@test.com');
            const adventure = await create_test_adventure('101', {
                title: 'Update Choice Adventure',
                description: 'Testing choice updates'
            });

            const sceneService = new SceneService(env.DB);
            const fromScene = await sceneService.createScene(adventure.id, {
                title: 'Start',
                content: 'Beginning',
                order: 0
            });
            const toScene = await sceneService.createScene(adventure.id, {
                title: 'End',
                content: 'Ending',
                order: 1
            });

            const choiceService = new ChoiceService(env.DB);
            const choice = await choiceService.createChoice(fromScene.id, {
                text: 'Original text',
                toSceneId: toScene.id,
                order: 0
            });

            const response = await make_request('choices', `/${adventure.id}/${fromScene.id}/${choice.id}`, {
                method: 'PUT',
                userId: '101',
                username: 'test4',
                email: 'test4@test.com',
                body: {
                    text: 'Updated text',
                    toSceneId: toScene.id,
                    order: 1,
                    condition: 'hasKey'
                }
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body).toMatchObject({
                id: choice.id,
                text: 'Updated text',
                toSceneId: toScene.id,
                order: 1,
                condition: 'hasKey'
            });
        });

        it('should delete a choice', async () => {
            await create_test_user('102', 'test5', 'test5@test.com');
            const adventure = await create_test_adventure('102', {
                title: 'Delete Choice Adventure',
                description: 'Testing choice deletion'
            });

            const sceneService = new SceneService(env.DB);
            const fromScene = await sceneService.createScene(adventure.id, {
                title: 'Start',
                content: 'Beginning',
                order: 0
            });
            const toScene = await sceneService.createScene(adventure.id, {
                title: 'End',
                content: 'Ending',
                order: 1
            });

            const choiceService = new ChoiceService(env.DB);
            const choice = await choiceService.createChoice(fromScene.id, {
                text: 'To be deleted',
                toSceneId: toScene.id,
                order: 0
            });

            const response = await make_request('choices', `/${adventure.id}/${fromScene.id}/${choice.id}`, {
                method: 'DELETE',
                userId: '102',
                username: 'test5',
                email: 'test5@test.com'
            });

            expect(response.status).toBe(200);
            const body = await response.json() as any;
            expect(body).toEqual({ success: true });

            const db = create_database();
            const deletedChoice = await db.select().from(choices).where(eq(choices.id, choice.id)).get();
            expect(deletedChoice).toBeUndefined();
        });

        // Edge cases
        it('should return 401 when accessing another user\'s adventure choices', async () => {
            await create_test_user('user1', 'owner', 'owner@test.com');
            await create_test_user('user2', 'other', 'other@test.com');

            const adventure = await create_test_adventure('user1', {
                title: 'Private Adventure',
                description: 'Not for others'
            });

            const sceneService = new SceneService(env.DB);
            const scene = await sceneService.createScene(adventure.id, {
                title: 'Private Scene',
                content: 'Secret content',
                order: 0
            });

            const response = await make_request('choices', `/${adventure.id}/${scene.id}`, {
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

            const response = await make_request('choices', `/${adventure.id}/nonexistent-id`, {
                userId: 'user3',
                username: 'test',
                email: 'test@test.com'
            });

            expect(response.status).toBe(404);
        });
    });

    describe('services', async () => {
        it('should create a choice', async () => {
            await create_test_user('123', 'test', 'test@test.com');
            const adventure = await create_test_adventure('123', {
                title: 'Test Adventure',
                description: 'Test Description'
            });

            const sceneService = new SceneService(env.DB);
            const fromScene = await sceneService.createScene(adventure.id, {
                title: 'From Scene',
                content: 'Starting point',
                order: 0
            });
            const toScene = await sceneService.createScene(adventure.id, {
                title: 'To Scene',
                content: 'Destination',
                order: 1
            });

            const choiceService = new ChoiceService(env.DB);
            const choice = await choiceService.createChoice(fromScene.id, {
                text: 'Test Choice',
                toSceneId: toScene.id,
                order: 0
            });

            expect(choice).toEqual({
                id: expect.any(String),
                fromSceneId: fromScene.id,
                toSceneId: toScene.id,
                text: 'Test Choice',
                imageUrl: null,
                condition: null,
                order: 0,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });
        });

        it('should handle choice deletion', async () => {
            await create_test_user('456', 'test2', 'test2@test.com');
            const adventure = await create_test_adventure('456', {
                title: 'Test Adventure',
                description: 'Test Description'
            });

            const sceneService = new SceneService(env.DB);
            const fromScene = await sceneService.createScene(adventure.id, {
                title: 'From Scene',
                content: 'Starting point',
                order: 0
            });
            const toScene = await sceneService.createScene(adventure.id, {
                title: 'To Scene',
                content: 'Destination',
                order: 1
            });

            const choiceService = new ChoiceService(env.DB);
            const choice = await choiceService.createChoice(fromScene.id, {
                text: 'To be deleted',
                toSceneId: toScene.id,
                order: 0
            });

            const result = await choiceService.deleteChoice(choice.id);
            expect(result).toBe(true);

            const db = create_database();
            const deletedChoice = await db.select().from(choices).where(eq(choices.id, choice.id)).get();
            expect(deletedChoice).toBeUndefined();
        });
    });
}); 