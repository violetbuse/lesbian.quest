import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/db";
import { projects } from "@/db/schema";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

interface CreateProjectRequest {
    title: string;
    description?: string;
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json() as CreateProjectRequest;
        if (!body.title) {
            return new NextResponse("Title is required", { status: 400 });
        }

        const db = createClient();
        const project = await db.insert(projects).values({
            id: nanoid(),
            title: body.title,
            description: body.description,
            userId,
        }).returning();

        return NextResponse.json(project[0]);
    } catch (error) {
        console.error("Error creating project:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 