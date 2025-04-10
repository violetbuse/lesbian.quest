import Link from 'next/link';
import { AuthButtons } from './AuthButtons';

export const Navbar = () => {
    return (
        <nav className="bg-purple-600 dark:bg-gray-900 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-white font-bold text-xl">
                    Lesbian.Quest
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/explore" className="text-white hover:text-gray-200">
                        Explore
                    </Link>

                    <AuthButtons />
                </div>
            </div>
        </nav>
    );
};
