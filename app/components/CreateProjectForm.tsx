"use client";

import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Textarea } from "@/app/ui/textarea";
import { createProject } from "@/app/actions/projects";

export function CreateProjectForm() {
    return (
        <form action={createProject} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                </label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Enter your story title"
                    required
                    className="w-full"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                </label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your story..."
                    className="w-full min-h-[100px]"
                />
            </div>
            <Button type="submit" className="w-full">
                Create Story
            </Button>
        </form>
    );
} 