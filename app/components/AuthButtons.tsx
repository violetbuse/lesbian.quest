import { SignedIn, SignedOut, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import { Button } from "@/app/ui/button";
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

export const AuthButtons = async () => {
    const { userId } = await auth();

    return (
        <>
            {userId && (
                <>
                    <Link href="/create" className="text-white hover:text-gray-200">
                        Create
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </>
            )}

            {!userId && (
                <>
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
                </>
            )}
        </>
    );
}; 