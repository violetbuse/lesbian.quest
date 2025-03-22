import { eq, and, or } from 'drizzle-orm';
import { createDb } from '../db';
import { scenes, playerProgress, choices } from '../db/schema';
import type { D1Database } from '@cloudflare/workers-types';
import { nanoid } from 'nanoid';

export interface CreateSceneData {
    title: string;
    content: string;
    imageUrl?: string | null;
    isStartScene?: boolean;
    order: number;
}

export interface UpdateSceneData extends CreateSceneData { }

export interface DeleteSceneResult {
    success: boolean;
    message: string;
    details: {
        deletedScene: {
            id: string;
            title: string;
        };
        redirectedTo: {
            id: string;
            title: string;
        };
        affectedData: {
            playerProgressUpdated: number;
            choicesRemoved: number;
        };
        warnings: string[];
    };
}

export class SceneService {
    private db;

    constructor(d1: D1Database) {
        this.db = createDb(d1);
    }

    async createScene(adventureId: string, data: CreateSceneData) {
        const scene = await this.db
            .insert(scenes)
            .values({
                id: nanoid(),
                adventureId,
                title: data.title,
                content: data.content,
                imageUrl: data.imageUrl,
                isStartScene: data.isStartScene ?? false,
                order: data.order,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning()
            .get();

        return scene;
    }

    async getAdventureScenes(adventureId: string) {
        const adventureScenes = await this.db
            .select()
            .from(scenes)
            .where(eq(scenes.adventureId, adventureId))
            .all();

        return adventureScenes;
    }

    async getScene(sceneId: string, adventureId: string) {
        const scene = await this.db
            .select()
            .from(scenes)
            .where(and(eq(scenes.id, sceneId), eq(scenes.adventureId, adventureId)))
            .get();

        return scene;
    }

    async updateScene(sceneId: string, data: UpdateSceneData) {
        const scene = await this.db
            .select()
            .from(scenes)
            .where(eq(scenes.id, sceneId))
            .get();

        if (!scene) return null;

        const updatedScene = await this.db
            .update(scenes)
            .set({
                title: data.title,
                content: data.content,
                imageUrl: data.imageUrl,
                isStartScene: data.isStartScene ?? scene.isStartScene,
                order: data.order,
                updatedAt: new Date(),
            })
            .where(eq(scenes.id, sceneId))
            .returning()
            .get();

        return updatedScene;
    }

    async deleteScene(sceneId: string, redirectProgressionToSceneId: string): Promise<DeleteSceneResult | null> {
        const sceneToDelete = await this.db
            .select()
            .from(scenes)
            .where(eq(scenes.id, sceneId))
            .get();

        const redirectScene = await this.db
            .select()
            .from(scenes)
            .where(eq(scenes.id, redirectProgressionToSceneId))
            .get();

        if (!sceneToDelete || !redirectScene) return null;

        // Prevent deletion of start scenes
        if (sceneToDelete.isStartScene) {
            throw new Error('Cannot delete the start scene. Set another scene as the start scene first.');
        }

        // Prevent redirecting to the scene being deleted
        if (redirectProgressionToSceneId === sceneId) {
            throw new Error('Cannot redirect to the scene being deleted');
        }

        // Get all choices that reference this scene
        const relatedChoices = await this.db
            .select()
            .from(choices)
            .where(
                or(
                    eq(choices.fromSceneId, sceneId),
                    eq(choices.toSceneId, sceneId)
                )
            )
            .all();

        // Get all player progress entries that need to be updated
        const affectedProgress = await this.db
            .select()
            .from(playerProgress)
            .where(eq(playerProgress.currentSceneId, sceneId))
            .all();

        try {
            // 1. Update all player progress that points to the scene being deleted
            if (affectedProgress.length > 0) {
                await this.db
                    .update(playerProgress)
                    .set({
                        currentSceneId: redirectProgressionToSceneId,
                        updatedAt: new Date(),
                    })
                    .where(eq(playerProgress.currentSceneId, sceneId));
            }

            // 2. Delete all choices that point to or from this scene
            if (relatedChoices.length > 0) {
                await this.db
                    .delete(choices)
                    .where(
                        or(
                            eq(choices.fromSceneId, sceneId),
                            eq(choices.toSceneId, sceneId)
                        )
                    );
            }

            // 3. Finally delete the scene
            await this.db.delete(scenes).where(eq(scenes.id, sceneId));

            // Prepare summary of changes
            const summary: DeleteSceneResult = {
                success: true,
                message: 'Scene deleted and related data updated',
                details: {
                    deletedScene: {
                        id: sceneId,
                        title: sceneToDelete.title,
                    },
                    redirectedTo: {
                        id: redirectProgressionToSceneId,
                        title: redirectScene.title,
                    },
                    affectedData: {
                        playerProgressUpdated: affectedProgress.length,
                        choicesRemoved: relatedChoices.length,
                    },
                    warnings: []
                }
            };

            // Add warnings if necessary
            if (relatedChoices.length > 0) {
                summary.details.warnings.push(
                    `Removed ${relatedChoices.length} choice${relatedChoices.length === 1 ? '' : 's'} that referenced this scene`
                );
            }
            if (affectedProgress.length > 0) {
                summary.details.warnings.push(
                    `Updated ${affectedProgress.length} player${affectedProgress.length === 1 ? "'s" : "s'"} progress to the new scene`
                );
            }

            return summary;
        } catch (error) {
            throw new Error(`Failed to delete scene and update progression: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 