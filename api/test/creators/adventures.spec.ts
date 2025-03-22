import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { AdventureService } from '../../src/services/adventures';
import { apply_migrations, create_authorization_header, create_database, create_test_user, create_test_adventure, make_adventures_request } from '../utils';
import { adventures } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('adventures', async () => {
    describe('api', async () => {
        it('should create an adventure', async () => {
            await create_test_user('123', 'test', 'test@test.com');

            const response = await make_adventures_request('', {
                method: 'POST',
                userId: '123',
                username: 'test',
                email: 'test@test.com',
                body: {
                    title: 'Test Adventure',
                    description: 'Test Description',
                }
            });

            const body = await response.json() as any;

            expect(response.status).toBe(201)
            expect(body).toEqual({
                id: expect.any(String),
                authorId: expect.any(String),
                title: 'Test Adventure',
                description: 'Test Description',
                isPublished: false,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });

            const db = create_database();
            const adventure = await db.select().from(adventures).where(eq(adventures.id, body.id)).get();
            expect(adventure).toEqual({
                id: expect.any(String),
                authorId: expect.any(String),
                title: 'Test Adventure',
                description: 'Test Description',
                isPublished: false,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });
        });

        it('should get all user adventures', async () => {
            await create_test_user('456', 'test2', 'test2@test.com');
            await create_test_adventure('456', {
                title: 'Adventure 1',
                description: 'Description 1',
            });
            await create_test_adventure('456', {
                title: 'Adventure 2',
                description: 'Description 2',
            });

            const response = await make_adventures_request('', {
                userId: '456',
                username: 'test2',
                email: 'test2@test.com'
            });

            const body = await response.json() as any[];
            expect(response.status).toBe(200);
            expect(body).toHaveLength(2);
            expect(body[0]).toMatchObject({
                title: 'Adventure 1',
                description: 'Description 1',
            });
            expect(body[1]).toMatchObject({
                title: 'Adventure 2',
                description: 'Description 2',
            });
        });

        it('should get a specific adventure', async () => {
            await create_test_user('789', 'test3', 'test3@test.com');
            const adventure = await create_test_adventure('789', {
                title: 'Get This Adventure',
                description: 'Test Description',
            });

            const response = await make_adventures_request(`/${adventure.id}`, {
                userId: '789',
                username: 'test3',
                email: 'test3@test.com'
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body).toMatchObject({
                id: adventure.id,
                title: 'Get This Adventure',
                description: 'Test Description',
            });
        });

        it('should update an adventure', async () => {
            await create_test_user('101', 'test4', 'test4@test.com');
            const adventure = await create_test_adventure('101', {
                title: 'Original Title',
                description: 'Original Description',
            });

            const response = await make_adventures_request(`/${adventure.id}`, {
                method: 'PUT',
                userId: '101',
                username: 'test4',
                email: 'test4@test.com',
                body: {
                    title: 'Updated Title',
                    description: 'Updated Description',
                    isPublished: true,
                }
            });

            const body = await response.json() as any;
            expect(response.status).toBe(200);
            expect(body).toMatchObject({
                id: adventure.id,
                title: 'Updated Title',
                description: 'Updated Description',
                isPublished: true,
            });
        });

        it('should delete an adventure', async () => {
            await create_test_user('102', 'test5', 'test5@test.com');
            const adventure = await create_test_adventure('102', {
                title: 'To Be Deleted',
                description: 'This will be deleted',
            });

            const response = await make_adventures_request(`/${adventure.id}`, {
                method: 'DELETE',
                userId: '102',
                username: 'test5',
                email: 'test5@test.com'
            });

            expect(response.status).toBe(200);
            const body = await response.json() as any;
            expect(body).toEqual({ success: true });

            const db = create_database();
            const deletedAdventure = await db.select().from(adventures).where(eq(adventures.id, adventure.id)).get();
            expect(deletedAdventure).toBeUndefined();
        });

        // Edge cases
        it('should return 401 when accessing another user\'s adventure', async () => {
            await create_test_user('user1', 'owner', 'owner@test.com');
            await create_test_user('user2', 'other', 'other@test.com');

            const adventure = await create_test_adventure('user1', {
                title: 'Private Adventure',
                description: 'Not for others',
            });

            const response = await make_adventures_request(`/${adventure.id}`, {
                userId: 'user2',
                username: 'other',
                email: 'other@test.com'
            });

            expect(response.status).toBe(401);
        });

        it('should return 404 when adventure not found', async () => {
            await create_test_user('user3', 'test', 'test@test.com');

            const response = await make_adventures_request('/nonexistent-id', {
                userId: 'user3',
                username: 'test',
                email: 'test@test.com'
            });

            expect(response.status).toBe(404);
        });
    });

    describe('services', async () => {
        it('should create an adventure', async () => {
            await create_test_user('123', 'test', 'test@test.com');
            const adventure = await create_test_adventure('123', {
                title: 'Test Adventure',
                description: 'Test Description',
            });

            expect(adventure).toEqual({
                id: expect.any(String),
                authorId: '123',
                title: 'Test Adventure',
                description: 'Test Description',
                isPublished: false,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });
        });

        it('should verify ownership correctly', async () => {
            await create_test_user('owner1', 'owner', 'owner@test.com');
            const adventure = await create_test_adventure('owner1', {
                title: 'Ownership Test',
                description: 'Testing ownership verification',
            });

            const service = new AdventureService(env.DB);
            const isOwner = await service.verifyOwnership(adventure.id, 'owner1');
            const isNotOwner = await service.verifyOwnership(adventure.id, 'other-user');

            expect(isOwner).toBe(true);
            expect(isNotOwner).toBe(false);
        });

        it('should handle non-existent adventure in verifyOwnership', async () => {
            const service = new AdventureService(env.DB);
            const isOwner = await service.verifyOwnership('non-existent-id', 'any-user');
            expect(isOwner).toBe(false);
        });
    });
});
