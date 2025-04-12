import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { CreateProjectForm } from "@/app/components/CreateProjectForm";

export default async function CreatePage() {
    const { userId } = await auth();
    const db = createClient();

    const userProjects = userId ? await db.query.projects.findMany({
        where: eq(projects.userId, userId),
        orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    }) : [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Create Project Form */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create a New Story</h1>
                        <CreateProjectForm />
                    </div>

                    {/* Existing Projects */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Stories</h2>
                        {userProjects.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">You haven't created any stories yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {userProjects.map((project) => (
                                    <Card key={project.id}>
                                        <CardHeader>
                                            <CardTitle>{project.title}</CardTitle>
                                            <CardDescription>
                                                {project.description || "No description provided"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    Created {new Date(project.createdAt).toLocaleDateString()}
                                                </span>
                                                <Button variant="outline" asChild>
                                                    <a href={`/stories/${project.id}`}>Edit Story</a>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 