import { applyD1Migrations, env as providedEnv, SELF } from "cloudflare:test"
import { createDb } from "../src/db";
import { users } from "../src/db/schema";
import { AdventureService } from "../src/services/adventures";
import type { CreateAdventureData } from "../src/services/adventures";

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

export const make_adventures_request = async (
    path: string = '',
    options: {
        method?: string;
        userId?: string;
        username?: string;
        email?: string;
        body?: any;
    } = {}
) => {
    const {
        method = 'GET',
        userId = 'test-user',
        username = 'test',
        email = 'test@test.com',
        body
    } = options;

    const headers: Record<string, string> = {
        'Authorization': create_authorization_header(userId, username, email)
    };

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
    } = {}
) => {
    const {
        method = 'GET',
        userId = 'test-user',
        username = 'test',
        email = 'test@test.com',
        body
    } = options;

    const headers: Record<string, string> = {
        'Authorization': create_authorization_header(userId, username, email)
    };

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    return await SELF.fetch(`https://lesbian.quest/api/creators/${endpoint}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
};
