"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export async function syncUser() {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    const user = await currentUser();

    if (!user) {
        return null;
    }

    const db = createClient();

    try {
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, userId))
            .get();

        if (!existingUser) {
            // Create new user if they don't exist
            return await db
                .insert(users)
                .values({
                    clerkId: userId,
                    email: user.emailAddresses[0]?.emailAddress || null,
                    name: `${user.firstName} ${user.lastName}`.trim() || null,
                })
                .returning()
                .get();
        }

        // Update existing user if their data has changed
        return await db
            .update(users)
            .set({
                email: user.emailAddresses[0]?.emailAddress || null,
                name: `${user.firstName} ${user.lastName}`.trim() || null,
            })
            .where(eq(users.clerkId, userId))
            .returning()
            .get();
    } catch (error) {
        console.error("Error syncing user:", error);
        return null;
    }
} 