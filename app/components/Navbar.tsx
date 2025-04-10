import Link from 'next/link';

export const Navbar = () => {
    return (
        <nav className="bg-purple-600 dark:bg-gray-900 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-white font-bold text-xl">
                    Lesbian Quest
                </Link>
                <div className="flex gap-4">
                    <Link href="/create" className="text-white hover:text-gray-200">
                        Create
                    </Link>
                    <Link href="/explore" className="text-white hover:text-gray-200">
                        Explore
                    </Link>
                </div>
            </div>
        </nav>
    );
};
