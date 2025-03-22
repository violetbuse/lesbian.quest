import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { create_database, create_test_user, make_request } from '../utils';
import { adventures, scenes, choices } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import type { Adventure } from '../../src/db/schema';

describe('atomic', async () => {
    describe('api', async () => {
        it('should execute multiple operations in sequence', async () => {
            await create_test_user('123', 'test', 'test@test.com');

            const response = await make_request('atomic', '', {
                method: 'POST',
                userId: '123',
                username: 'test',
                email: 'test@test.com',
                body: {
                    operations: [
                        {
                            type: 'createAdventure',
                            data: {
                                title: 'New Adventure',
                                description: 'Created via atomic operation'
                            }
                        }
                    ]
                }
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.results).toHaveLength(1);
            expect(body.results[0]).toMatchObject({
                title: 'New Adventure',
                description: 'Created via atomic operation'
            });

            const adventureId = body.results[0].id;

            // Create scenes and choices in one atomic operation
            const complexResponse = await make_request('atomic', '', {
                method: 'POST',
                userId: '123',
                username: 'test',
                email: 'test@test.com',
                body: {
                    operations: [
                        {
                            type: 'createScene',
                            adventureId,
                            data: {
                                title: 'Opening Scene',
                                content: 'The beginning',
                                isStartScene: true,
                                order: 0
                            }
                        },
                        {
                            type: 'createScene',
                            adventureId,
                            data: {
                                title: 'Second Scene',
                                content: 'The continuation',
                                order: 1
                            }
                        }
                    ]
                }
            });

            const complexBody = await complexResponse.json() as any;
            expect(complexResponse.status).toBe(200);
            expect(complexBody.success).toBe(true);
            expect(complexBody.results).toHaveLength(2);

            const scene1Id = complexBody.results[0].id;
            const scene2Id = complexBody.results[1].id;

            // Add a choice connecting the scenes
            const choiceResponse = await make_request('atomic', '', {
                method: 'POST',
                userId: '123',
                username: 'test',
                email: 'test@test.com',
                body: {
                    operations: [
                        {
                            type: 'createChoice',
                            fromSceneId: scene1Id,
                            data: {
                                text: 'Continue to next scene',
                                toSceneId: scene2Id,
                                order: 0
                            }
                        }
                    ]
                }
            });

            const choiceBody = await choiceResponse.json() as any;
            expect(choiceResponse.status).toBe(200);
            expect(choiceBody.success).toBe(true);
            expect(choiceBody.results).toHaveLength(1);
            expect(choiceBody.results[0]).toMatchObject({
                fromSceneId: scene1Id,
                toSceneId: scene2Id,
                text: 'Continue to next scene'
            });

            // Verify final state in database
            const db = create_database();
            const adventure = await db.select().from(adventures).where(eq(adventures.id, adventureId)).get();
            const sceneCount = await db.select().from(scenes).where(eq(scenes.adventureId, adventureId)).all();
            const choiceCount = await db.select().from(choices).where(eq(choices.fromSceneId, scene1Id)).all();

            expect(adventure).toBeDefined();
            expect(sceneCount).toHaveLength(2);
            expect(choiceCount).toHaveLength(1);
        });

        it('should handle mixed update and delete operations', async () => {
            await create_test_user('456', 'test2', 'test2@test.com');

            // First create an adventure with scenes
            const setupResponse = await make_request('atomic', '', {
                method: 'POST',
                userId: '456',
                username: 'test2',
                email: 'test2@test.com',
                body: {
                    operations: [
                        {
                            type: 'createAdventure',
                            data: {
                                title: 'Update Test Adventure',
                                description: 'Testing updates and deletes'
                            }
                        }
                    ]
                }
            });

            const setupBody = await setupResponse.json() as any;
            const adventureId = setupBody.results[0].id;

            // Create two scenes
            const scenesResponse = await make_request('atomic', '', {
                method: 'POST',
                userId: '456',
                username: 'test2',
                email: 'test2@test.com',
                body: {
                    operations: [
                        {
                            type: 'createScene',
                            adventureId,
                            data: {
                                title: 'First Scene',
                                content: 'Original content',
                                isStartScene: true,
                                order: 0
                            }
                        },
                        {
                            type: 'createScene',
                            adventureId,
                            data: {
                                title: 'Second Scene',
                                content: 'To be deleted',
                                order: 1
                            }
                        }
                    ]
                }
            });

            const scenesBody = await scenesResponse.json() as any;
            const scene1Id = scenesBody.results[0].id;
            const scene2Id = scenesBody.results[1].id;

            // Now perform mixed update and delete operations
            const response = await make_request('atomic', '', {
                method: 'POST',
                userId: '456',
                username: 'test2',
                email: 'test2@test.com',
                body: {
                    operations: [
                        {
                            type: 'updateScene',
                            id: scene1Id,
                            data: {
                                title: 'Updated First Scene',
                                content: 'Updated content',
                                isStartScene: true,
                                order: 0
                            }
                        },
                        {
                            type: 'deleteScene',
                            id: scene2Id,
                            redirectProgressionToSceneId: scene1Id
                        }
                    ]
                }
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.results).toHaveLength(2);

            // Verify the final state
            const db = create_database();
            const updatedScene = await db.select().from(scenes).where(eq(scenes.id, scene1Id)).get();
            const deletedScene = await db.select().from(scenes).where(eq(scenes.id, scene2Id)).get();

            expect(updatedScene).toMatchObject({
                title: 'Updated First Scene',
                content: 'Updated content'
            });
            expect(deletedScene).toBeUndefined();
        });

        it('should fail all operations if one fails', async () => {
            await create_test_user('789', 'test3', 'test3@test.com');

            const response = await make_request('atomic', '', {
                method: 'POST',
                userId: '789',
                username: 'test3',
                email: 'test3@test.com',
                body: {
                    operations: [
                        {
                            type: 'createAdventure',
                            data: {
                                title: 'Valid Adventure',
                                description: 'This should work'
                            }
                        },
                        {
                            type: 'updateAdventure',
                            id: 'non-existent-id',
                            data: {
                                title: 'Invalid Update',
                                description: 'This should fail'
                            }
                        }
                    ]
                }
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body.success).toBe(false);

            // Verify no adventure was created
            const db = create_database();
            const allAdventures = await db.select().from(adventures).all();
            const adventureCount = allAdventures.filter((a: Adventure) => a.authorId === '789').length;
            expect(adventureCount).toBe(0);
        });

        it('should prevent unauthorized operations', async () => {
            await create_test_user('user1', 'owner', 'owner@test.com');
            await create_test_user('user2', 'other', 'other@test.com');

            // Create an adventure as user1
            const setupResponse = await make_request('atomic', '', {
                method: 'POST',
                userId: 'user1',
                username: 'owner',
                email: 'owner@test.com',
                body: {
                    operations: [
                        {
                            type: 'createAdventure',
                            data: {
                                title: 'Protected Adventure',
                                description: 'Should not be modifiable by others'
                            }
                        }
                    ]
                }
            });

            const setupBody = await setupResponse.json() as any;
            const adventureId = setupBody.results[0].id;

            // Try to modify as user2
            const response = await make_request('atomic', '', {
                method: 'POST',
                userId: 'user2',
                username: 'other',
                email: 'other@test.com',
                body: {
                    operations: [
                        {
                            type: 'updateAdventure',
                            id: adventureId,
                            data: {
                                title: 'Unauthorized Update',
                                description: 'This should fail'
                            }
                        }
                    ]
                }
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body.success).toBe(false);
            expect(body.results[0].error).toBe('Unauthorized operation in batch');

            // Verify the adventure was not modified
            const db = create_database();
            const adventure = await db.select().from(adventures).where(eq(adventures.id, adventureId)).get();
            expect(adventure).toMatchObject({
                title: 'Protected Adventure',
                description: 'Should not be modifiable by others'
            });
        });
    });
}); 