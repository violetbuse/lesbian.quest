'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/db';
import { projects, users } from '@/db/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

export async function createProject(formData: FormData) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized');
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title) {
        throw new Error('Title is required');
    }

    try {
        const db = createClient();

        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, userId),
        });

        if (!user) {
            throw new Error('User not found');
        }

        const project = await db.insert(projects).values({
            id: nanoid(),
            title,
            description: description || null,
            userId: user.id,
        }).returning().get();

        console.log(project);

        revalidatePath('/');
    } catch (error) {
        console.error('Error creating project:', error);
        throw new Error('Failed to create project');
    }
} 