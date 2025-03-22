import { env, SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { AdventureService } from '../../src/services/adventures';
import { apply_migrations, create_authorization_header, create_database, create_test_user } from '../utils';
import { adventures } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('adventures', async () => {
    describe('api', async () => {
        it('should create an adventure', async () => {
            const response = await SELF.fetch('https://lesbian.quest/api/creators/adventures', {
                method: 'POST',
                headers: {
                    'Authorization': create_authorization_header('123', 'test', 'test@test.com'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'Test Adventure',
                    description: 'Test Description',
                })
            });

            const body = await response.json();

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
    });

    describe('services', async () => {
        it('should create an adventure', async () => {
            const service = new AdventureService(env.DB);

            await create_test_user('123', 'test', 'test@test.com');

            const adventure = await service.createAdventure('123', {
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
    });
});
