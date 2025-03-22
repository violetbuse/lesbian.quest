import { eq, and } from 'drizzle-orm';
import { createDb } from '../db';
import { choices } from '../db/schema';
import type { D1Database } from '@cloudflare/workers-types';

export interface CreateChoiceData {
    text: string;
    toSceneId: string;
    imageUrl?: string | null;
    condition?: string;
    order: number;
}

export interface UpdateChoiceData extends CreateChoiceData { }

export class ChoiceService {
    private db;

    constructor(d1: D1Database) {
        this.db = createDb(d1);
    }

    async createChoice(fromSceneId: string, data: CreateChoiceData) {
        const choice = await this.db
            .insert(choices)
            .values({
                id: crypto.randomUUID(),
                fromSceneId,
                toSceneId: data.toSceneId,
                text: data.text,
                imageUrl: data.imageUrl,
                condition: data.condition,
                order: data.order,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning()
            .get();

        return choice;
    }

    async getSceneChoices(fromSceneId: string) {
        const sceneChoices = await this.db
            .select()
            .from(choices)
            .where(eq(choices.fromSceneId, fromSceneId))
            .all();

        return sceneChoices;
    }

    async getChoice(choiceId: string, fromSceneId: string) {
        const choice = await this.db
            .select()
            .from(choices)
            .where(and(eq(choices.id, choiceId), eq(choices.fromSceneId, fromSceneId)))
            .get();

        return choice;
    }

    async updateChoice(choiceId: string, data: UpdateChoiceData) {
        const choice = await this.db
            .select()
            .from(choices)
            .where(eq(choices.id, choiceId))
            .get();

        if (!choice) return null;

        const updatedChoice = await this.db
            .update(choices)
            .set({
                toSceneId: data.toSceneId,
                text: data.text,
                imageUrl: data.imageUrl,
                condition: data.condition,
                order: data.order,
                updatedAt: new Date(),
            })
            .where(eq(choices.id, choiceId))
            .returning()
            .get();

        return updatedChoice;
    }

    async deleteChoice(choiceId: string) {
        await this.db.delete(choices).where(eq(choices.id, choiceId));
        return true;
    }
} 