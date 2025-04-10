"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function syncUser() {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    const user = await currentUser();

    if (!user) {
        return null;
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        });

        if (!existingUser) {
            // Create new user if they don't exist
            return await prisma.user.create({
                data: {
                    clerkId: userId,
                    email: user.emailAddresses[0]?.emailAddress || null,
                    name: `${user.firstName} ${user.lastName}`.trim() || null,
                },
            });
        }

        // Update existing user if their data has changed
        return await prisma.user.update({
            where: {
                clerkId: userId,
            },
            data: {
                email: user.emailAddresses[0]?.emailAddress || null,
                name: `${user.firstName} ${user.lastName}`.trim() || null,
            },
        });
    } catch (error) {
        console.error("Error syncing user:", error);
        return null;
    }
} 