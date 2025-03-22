import { applyD1Migrations, env as providedEnv } from "cloudflare:test"
import { createDb } from "../src/db";
import { users } from "../src/db/schema";

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
