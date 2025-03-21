import { createClerkClient } from '@clerk/backend';
import { createDb } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

async function syncClerkUser(db: ReturnType<typeof createDb>, clerk: ReturnType<typeof createClerkClient>, userId: string) {
    const user = await clerk.users.getUser(userId);
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
            id: crypto.randomUUID(),
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

export async function getUser(request: Request, env: { CLERK_SECRET_KEY: string; DB: D1Database }): Promise<string | null> {
    const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
    const { userId } = await clerk.sessions.getSession(request.headers.get('Authorization')?.replace('Bearer ', '') || '');

    if (!userId) {
        return null;
    }

    // Get or create user from database using Drizzle
    const db = createDb(env.DB);
    const user = await syncClerkUser(db, clerk, userId);
    return user?.id || null;
} 