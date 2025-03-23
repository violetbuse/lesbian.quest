import { eq, and } from 'drizzle-orm';
import { createDb } from '../db';
import { favorites, likes, saves, playerProgress } from '../db/schema';
import type { D1Database } from '@cloudflare/workers-types';
import { nanoid } from 'nanoid';

export interface UserInteractions {
    favorites: any[];
    likes: any[];
    saves: any[];
    played: any[];
}

export class InteractionsService {
    private db;

    constructor(d1: D1Database) {
        this.db = createDb(d1);
    }

    // Favorites
    async addFavorite(userId: string, adventureId: string) {
        const existing = await this.db.query.favorites.findFirst({
            where: and(
                eq(favorites.userId, userId),
                eq(favorites.adventureId, adventureId)
            ),
        });

        if (existing) {
            return false;
        }

        await this.db.insert(favorites).values({
            id: nanoid(),
            userId,
            adventureId,
        });

        return true;
    }

    async removeFavorite(userId: string, adventureId: string) {
        await this.db.delete(favorites).where(
            and(
                eq(favorites.userId, userId),
                eq(favorites.adventureId, adventureId)
            )
        );
        return true;
    }

    // Likes
    async addLike(userId: string, adventureId: string) {
        const existing = await this.db.query.likes.findFirst({
            where: and(
                eq(likes.userId, userId),
                eq(likes.adventureId, adventureId)
            ),
        });

        if (existing) {
            return false;
        }

        await this.db.insert(likes).values({
            id: nanoid(),
            userId,
            adventureId,
        });

        return true;
    }

    async removeLike(userId: string, adventureId: string) {
        await this.db.delete(likes).where(
            and(
                eq(likes.userId, userId),
                eq(likes.adventureId, adventureId)
            )
        );
        return true;
    }

    // Saves
    async addSave(userId: string, adventureId: string) {
        const existing = await this.db.query.saves.findFirst({
            where: and(
                eq(saves.userId, userId),
                eq(saves.adventureId, adventureId)
            ),
        });

        if (existing) {
            return false;
        }

        await this.db.insert(saves).values({
            id: nanoid(),
            userId,
            adventureId,
        });

        return true;
    }

    async removeSave(userId: string, adventureId: string) {
        await this.db.delete(saves).where(
            and(
                eq(saves.userId, userId),
                eq(saves.adventureId, adventureId)
            )
        );
        return true;
    }

    // Get all interactions
    async getUserInteractions(userId: string): Promise<UserInteractions> {
        const [favoritesList, likesList, savesList, playedList] = await Promise.all([
            this.db.query.favorites.findMany({
                where: eq(favorites.userId, userId),
                with: {
                    adventure: true,
                },
            }),
            this.db.query.likes.findMany({
                where: eq(likes.userId, userId),
                with: {
                    adventure: true,
                },
            }),
            this.db.query.saves.findMany({
                where: eq(saves.userId, userId),
                with: {
                    adventure: true,
                },
            }),
            this.db.query.playerProgress.findMany({
                where: eq(playerProgress.userId, userId),
                with: {
                    adventure: true,
                },
            }),
        ]);

        return {
            favorites: favoritesList.map(f => f.adventure),
            likes: likesList.map(l => l.adventure),
            saves: savesList.map(s => s.adventure),
            played: playedList.map(p => p.adventure),
        };
    }
} 