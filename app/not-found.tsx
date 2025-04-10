import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="relative">
                    <h1 className="text-9xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                        404
                    </h1>
                    <div className="absolute -top-4 -right-4 text-6xl">🔍</div>
                    <div className="absolute -bottom-4 -left-4 text-6xl">💫</div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Oops! Page Not Found
                </h2>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Looks like you've wandered off the path. Don't worry, every adventure has its detours!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Return Home
                    </Link>
                    <Link
                        href="/explore"
                        className="bg-white hover:bg-gray-100 text-purple-600 font-semibold py-3 px-6 rounded-lg transition-colors border border-purple-600"
                    >
                        Explore Stories
                    </Link>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-4">
                    <div className="text-4xl">🌈</div>
                    <div className="text-4xl">✨</div>
                    <div className="text-4xl">🎮</div>
                </div>
            </div>
        </div>
    );
} 