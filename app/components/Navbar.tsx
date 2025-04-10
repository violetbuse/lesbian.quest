'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from "@/app/ui/button";

export const Navbar = () => {
    return (
        <nav className="bg-purple-600 dark:bg-gray-900 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-white font-bold text-xl">
                    Lesbian.Quest
                </Link>
                <div className="flex items-center gap-4">
                    {/* Links visible to everyone (adjust as needed) */}
                    <Link href="/explore" className="text-white hover:text-gray-200">
                        Explore
                    </Link>

                    {/* Links/Buttons for Signed In users */}
                    <SignedIn>
                        <Link href="/create" className="text-white hover:text-gray-200">
                            Create
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>

                    {/* Buttons for Signed Out users */}
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost" className="text-white hover:text-gray-900">
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button variant="default" className="bg-white text-purple-600 hover:bg-purple-700 hover:text-white shadow-lg">
                                Sign Up
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                </div>
            </div>
        </nav>
    );
};
