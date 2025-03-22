import { eq, and } from 'drizzle-orm';
import { createDb } from '../db';
import { playerProgress } from '../db/schema';
import type { D1Database } from '@cloudflare/workers-types';
import { nanoid } from 'nanoid';

export interface CreateProgressData {
    adventureId: string;
    currentSceneId: string;
    variables: Record<string, any>;
}

export interface UpdateProgressData {
    currentSceneId?: string;
    variables?: Record<string, any>;
}

export class ProgressService {
    private db;

    constructor(d1: D1Database) {
        this.db = createDb(d1);
    }

    async getProgress(userId: string, adventureId: string) {
        const progress = await this.db.query.playerProgress.findFirst({
            where: and(
                eq(playerProgress.userId, userId),
                eq(playerProgress.adventureId, adventureId)
            ),
            with: {
                currentScene: true,
            },
        });

        if (!progress) return null;

        return {
            ...progress,
            variables: JSON.parse(progress.variables),
        };
    }

    async createProgress(userId: string, data: CreateProgressData) {
        const now = new Date();
        const newProgress = await this.db.insert(playerProgress).values({
            id: nanoid(),
            userId,
            adventureId: data.adventureId,
            currentSceneId: data.currentSceneId,
            variables: JSON.stringify(data.variables),
            createdAt: now,
            updatedAt: now,
        }).returning();

        return {
            ...newProgress[0],
            variables: JSON.parse(newProgress[0].variables),
        };
    }

    async updateProgress(userId: string, adventureId: string, data: UpdateProgressData) {
        const existingProgress = await this.db.query.playerProgress.findFirst({
            where: and(
                eq(playerProgress.userId, userId),
                eq(playerProgress.adventureId, adventureId)
            ),
        });

        if (!existingProgress) return null;

        // Merge existing variables with new ones if provided
        const currentVariables = JSON.parse(existingProgress.variables);
        const updatedVariables = data.variables
            ? JSON.stringify({ ...currentVariables, ...data.variables })
            : existingProgress.variables;

        const updatedProgress = await this.db
            .update(playerProgress)
            .set({
                currentSceneId: data.currentSceneId || existingProgress.currentSceneId,
                variables: updatedVariables,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(playerProgress.userId, userId),
                    eq(playerProgress.adventureId, adventureId)
                )
            )
            .returning();

        return {
            ...updatedProgress[0],
            variables: JSON.parse(updatedProgress[0].variables),
        };
    }

    async deleteProgress(userId: string, adventureId: string) {
        const existingProgress = await this.db.query.playerProgress.findFirst({
            where: and(
                eq(playerProgress.userId, userId),
                eq(playerProgress.adventureId, adventureId)
            ),
        });

        if (!existingProgress) return false;

        await this.db
            .delete(playerProgress)
            .where(
                and(
                    eq(playerProgress.userId, userId),
                    eq(playerProgress.adventureId, adventureId)
                )
            );

        return true;
    }
} 