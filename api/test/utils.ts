import { applyD1Migrations, env as providedEnv, SELF } from "cloudflare:test"
import { createDb } from "../src/db";
import { users, scenes, choices } from "../src/db/schema";
import { AdventureService } from "../src/services/adventures";
import { ProgressService } from "../src/services/progress";
import type { CreateAdventureData } from "../src/services/adventures";
import type { CreateProgressData } from "../src/services/progress";
import { nanoid } from 'nanoid';

export const apply_migrations = async (env: typeof providedEnv) => {
    await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
}

await apply_migrations(providedEnv);

export const create_test_user = async (userId: string, username: string, email: string) => {
    const db = createDb(providedEnv.DB);

    await db.insert(users).values({
        id: userId,
        clerkId: userId,
        username,
        email,
    });
}

export const create_authorization_header = (userId: string, username: string, email: string) => JSON.stringify({
    userId,
    username,
    email,
    role: "user",
    clerkId: userId,
});

export const create_database = () => createDb(providedEnv.DB);

export const create_test_adventure = async (userId: string, data: CreateAdventureData) => {
    const service = new AdventureService(providedEnv.DB);
    return await service.createAdventure(userId, data);
};

export const create_test_scene = async (adventureId: string, data: {
    title: string;
    content: string;
    isStartScene?: boolean;
    order: number;
}) => {
    const db = createDb(providedEnv.DB);
    const result = await db.insert(scenes).values({
        id: nanoid(),
        adventureId,
        title: data.title,
        content: data.content,
        isStartScene: data.isStartScene ?? false,
        order: data.order,
    }).returning();
    return result[0];
};

export const create_test_choice = async (fromSceneId: string, toSceneId: string, data: {
    text: string;
    order: number;
}) => {
    const db = createDb(providedEnv.DB);
    const result = await db.insert(choices).values({
        id: nanoid(),
        fromSceneId,
        toSceneId,
        text: data.text,
        order: data.order,
    }).returning();
    return result[0];
};

export const create_test_progress = async (userId: string, data: CreateProgressData) => {
    const service = new ProgressService(providedEnv.DB);
    const progress = await service.createProgress(userId, data);

    // Fetch the progress again to get the currentScene relation
    return await service.getProgress(userId, data.adventureId);
};

export const make_adventures_request = async (
    path: string = '',
    options: {
        method?: string;
        userId?: string;
        username?: string;
        email?: string;
        body?: any;
        authenticated?: boolean;
    } = {}
) => {
    const {
        method = 'GET',
        userId = 'test-user',
        username = 'test',
        email = 'test@test.com',
        body,
        authenticated = true
    } = options;

    const headers: Record<string, string> = {};
    if (authenticated) {
        headers['Authorization'] = create_authorization_header(userId, username, email);
    }

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    return await SELF.fetch(`https://lesbian.quest/api/creators/adventures${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
};

export const make_request = async (
    endpoint: 'scenes' | 'choices' | 'atomic',
    path: string = '',
    options: {
        method?: string;
        userId?: string;
        username?: string;
        email?: string;
        body?: any;
        authenticated?: boolean;
    } = {}
) => {
    const {
        method = 'GET',
        userId = 'test-user',
        username = 'test',
        email = 'test@test.com',
        body,
        authenticated = true
    } = options;

    const headers: Record<string, string> = {};
    if (authenticated) {
        headers['Authorization'] = create_authorization_header(userId, username, email);
    }

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    return await SELF.fetch(`https://lesbian.quest/api/creators/${endpoint}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
};

export const make_progress_request = async (
    path: string = '',
    options: {
        method?: string;
        userId?: string;
        username?: string;
        email?: string;
        body?: any;
        authenticated?: boolean;
    } = {}
) => {
    const {
        method = 'GET',
        userId = 'test-user',
        username = 'test',
        email = 'test@test.com',
        body,
        authenticated = true
    } = options;

    const headers: Record<string, string> = {};
    if (authenticated) {
        headers['Authorization'] = create_authorization_header(userId, username, email);
    }

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    return await SELF.fetch(`https://lesbian.quest/api/players/progress${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
};

export const make_interactions_request = async (
    path: string = '',
    options: {
        method?: string;
        userId?: string;
        username?: string;
        email?: string;
        body?: any;
        authenticated?: boolean;
    } = {}
) => {
    const {
        method = 'GET',
        userId = 'test-user',
        username = 'test',
        email = 'test@test.com',
        body,
        authenticated = true
    } = options;

    const headers: Record<string, string> = {};
    if (authenticated) {
        headers['Authorization'] = create_authorization_header(userId, username, email);
    }

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    return await SELF.fetch(`https://lesbian.quest/api/players/adventures${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
};
