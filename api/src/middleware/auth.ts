import { createClerkClient } from '@clerk/backend';
import { createDb } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Context } from 'hono';
import type { Env } from '../types';
import { nanoid } from 'nanoid';

type TestUser = {
    userId: string;
    username: string;
    email: string;
    role: string;
    clerkId: string;
};

async function getClerkUserDetails(env: Env, authHeader: string | null) {
    // In test environment, parse the auth header directly
    if (env.ENVIRONMENT === 'test' || env.ENVIRONMENT === 'testing') {
        if (!authHeader) return null;
        try {
            const testUser = JSON.parse(authHeader) as TestUser;
            return {
                id: testUser.userId,
                username: testUser.username,
                firstName: testUser.username,
                emailAddresses: [{ emailAddress: testUser.email }]
            };
        } catch {
            return null;
        }
    }

    // Production environment uses Clerk
    const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
    try {
        // Get session
        const sessionToken = authHeader?.replace('Bearer ', '') || '';
        const session = await clerk.sessions.getSession(sessionToken);
        if (!session?.userId) return null;

        // Get user details
        const user = await clerk.users.getUser(session.userId);
        return user;
    } catch (error) {
        return null;
    }
}

export async function getUser(request: Request, env: Env): Promise<string | null> {
    const authHeader = request.headers.get('Authorization');
    const user = await getClerkUserDetails(env, authHeader);
    if (!user) {
        return null;
    }

    // Get user from database using Drizzle
    const db = createDb(env.DB);
    const dbUser = await syncClerkUser(db, env, user.id, authHeader);
    return dbUser?.id || null;
}

async function syncClerkUser(db: ReturnType<typeof createDb>, env: Env, userId: string, authHeader: string | null) {
    const user = await getClerkUserDetails(env, authHeader);
    if (!user) return null;

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.clerkId, userId)).get();

    if (existingUser) {
        // Update last login
        await db
            .update(users)
            .set({
                lastLogin: new Date(),
                email: user.emailAddresses[0]?.emailAddress,
                username: user.username || user.firstName || 'user',
            })
            .where(eq(users.clerkId, userId));
        return existingUser;
    }

    // Create new user
    const newUser = await db
        .insert(users)
        .values({
            id: nanoid(),
            clerkId: userId,
            email: user.emailAddresses[0]?.emailAddress || '',
            username: user.username || user.firstName || 'user',
            createdAt: new Date(),
            lastLogin: new Date(),
        })
        .returning()
        .get();

    return newUser;
}

// Hono middleware helper
export async function getUserFromContext(c: Context<{ Bindings: Env }>): Promise<string | null> {
    return getUser(c.req.raw, c.env);
} 