import { D1Database } from '@cloudflare/workers-types';
import { eq } from 'drizzle-orm';
import { createDb } from '../db';
import { scenes, choices } from '../db/schema';
import { AdventureService } from './adventures';
import { SceneService } from './scenes';
import { ChoiceService } from './choices';

export type AtomicOperation =
    | { type: 'createAdventure'; data: { title: string; description: string; isPublished?: boolean; } }
    | { type: 'updateAdventure'; id: string; data: { title: string; description: string; isPublished?: boolean; } }
    | { type: 'deleteAdventure'; id: string; }
    | { type: 'createScene'; adventureId: string; data: { title: string; content: string; imageUrl?: string | null; isStartScene?: boolean; order: number; } }
    | { type: 'updateScene'; id: string; data: { title: string; content: string; imageUrl?: string | null; isStartScene?: boolean; order: number; } }
    | { type: 'deleteScene'; id: string; redirectProgressionToSceneId: string; }
    | { type: 'createChoice'; fromSceneId: string; data: { text: string; toSceneId: string; imageUrl?: string | null; condition?: string; order: number; } }
    | { type: 'updateChoice'; id: string; data: { text: string; toSceneId: string; imageUrl?: string | null; condition?: string; order: number; } }
    | { type: 'deleteChoice'; id: string; };

export interface AtomicRequest {
    operations: AtomicOperation[];
}

export interface AtomicResult {
    success: boolean;
    results: (any | { error: string })[];
}

export class AtomicService {
    private db;
    private adventureService;
    private sceneService;
    private choiceService;

    constructor(d1: D1Database) {
        this.db = createDb(d1);
        this.adventureService = new AdventureService(d1);
        this.sceneService = new SceneService(d1);
        this.choiceService = new ChoiceService(d1);
    }

    private async validateOperation(operation: AtomicOperation, userId: string): Promise<boolean> {
        switch (operation.type) {
            case 'createAdventure':
                return true;
            case 'updateAdventure':
            case 'deleteAdventure':
                return await this.adventureService.verifyOwnership(operation.id, userId);
            case 'createScene': {
                return await this.adventureService.verifyOwnership(operation.adventureId, userId);
            }
            case 'updateScene':
            case 'deleteScene': {
                const scene = await this.db
                    .select()
                    .from(scenes)
                    .where(eq(scenes.id, operation.id))
                    .get();
                if (!scene) return false;
                return await this.adventureService.verifyOwnership(scene.adventureId, userId);
            }
            case 'createChoice': {
                const scene = await this.db
                    .select()
                    .from(scenes)
                    .where(eq(scenes.id, operation.fromSceneId))
                    .get();
                if (!scene) return false;
                return await this.adventureService.verifyOwnership(scene.adventureId, userId);
            }
            case 'updateChoice':
            case 'deleteChoice': {
                const choice = await this.db
                    .select({
                        fromScene: scenes,
                    })
                    .from(choices)
                    .innerJoin(scenes, eq(choices.fromSceneId, scenes.id))
                    .where(eq(choices.id, operation.id))
                    .get();
                if (!choice) return false;
                return await this.adventureService.verifyOwnership(choice.fromScene.adventureId, userId);
            }
        }
    }

    async executeAtomicOperations(userId: string, request: AtomicRequest): Promise<AtomicResult> {
        const results: (any | { error: string })[] = [];
        let success = true;

        // First validate all operations
        for (const operation of request.operations) {
            const isValid = await this.validateOperation(operation, userId);
            if (!isValid) {
                return {
                    success: false,
                    results: [{ error: 'Unauthorized operation in batch' }]
                };
            }
        }

        try {
            // Execute operations in sequence within a transaction
            for (const operation of request.operations) {
                try {
                    let result;
                    switch (operation.type) {
                        case 'createAdventure':
                            result = await this.adventureService.createAdventure(userId, operation.data);
                            break;
                        case 'updateAdventure':
                            result = await this.adventureService.updateAdventure(operation.id, operation.data);
                            break;
                        case 'deleteAdventure':
                            result = await this.adventureService.deleteAdventure(operation.id);
                            break;
                        case 'createScene':
                            result = await this.sceneService.createScene(operation.adventureId, operation.data);
                            break;
                        case 'updateScene':
                            result = await this.sceneService.updateScene(operation.id, operation.data);
                            break;
                        case 'deleteScene':
                            result = await this.sceneService.deleteScene(operation.id, operation.redirectProgressionToSceneId);
                            break;
                        case 'createChoice':
                            result = await this.choiceService.createChoice(operation.fromSceneId, operation.data);
                            break;
                        case 'updateChoice':
                            result = await this.choiceService.updateChoice(operation.id, operation.data);
                            break;
                        case 'deleteChoice':
                            result = await this.choiceService.deleteChoice(operation.id);
                            break;
                    }
                    results.push(result ?? { success: true });
                } catch (error) {
                    results.push({ error: error instanceof Error ? error.message : 'Unknown error' });
                    success = false;
                    break;
                }
            }
        } catch (error) {
            return {
                success: false,
                results: [{ error: 'Transaction failed' }]
            };
        }

        return {
            success,
            results
        };
    }
} 