import { eq } from 'drizzle-orm';
import { createDb } from '../db';
import { adventures } from '../db/schema';
import type { D1Database } from '@cloudflare/workers-types';

export interface CreateAdventureData {
    title: string;
    description: string;
    isPublished?: boolean;
}

export interface UpdateAdventureData extends CreateAdventureData { }

export class AdventureService {
    private db;

    constructor(d1: D1Database) {
        this.db = createDb(d1);
    }

    async createAdventure(userId: string, data: CreateAdventureData) {
        const adventure = await this.db
            .insert(adventures)
            .values({
                id: crypto.randomUUID(),
                authorId: userId,
                title: data.title,
                description: data.description,
                isPublished: data.isPublished ?? false,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning()
            .get();

        return adventure;
    }

    async getUserAdventures(userId: string) {
        const userAdventures = await this.db
            .select()
            .from(adventures)
            .where(eq(adventures.authorId, userId))
            .all();

        return userAdventures;
    }

    async getAdventure(adventureId: string) {
        const adventure = await this.db
            .select()
            .from(adventures)
            .where(eq(adventures.id, adventureId))
            .get();

        return adventure;
    }

    async updateAdventure(adventureId: string, data: UpdateAdventureData) {
        const adventure = await this.db
            .select()
            .from(adventures)
            .where(eq(adventures.id, adventureId))
            .get();

        if (!adventure) return null;

        const updatedAdventure = await this.db
            .update(adventures)
            .set({
                title: data.title,
                description: data.description,
                isPublished: data.isPublished ?? adventure.isPublished,
                updatedAt: new Date(),
            })
            .where(eq(adventures.id, adventureId))
            .returning()
            .get();

        return updatedAdventure;
    }

    async deleteAdventure(adventureId: string) {
        await this.db.delete(adventures).where(eq(adventures.id, adventureId));
        return true;
    }

    async verifyOwnership(adventureId: string, userId: string) {
        const adventure = await this.getAdventure(adventureId);
        return adventure?.authorId === userId;
    }
} 