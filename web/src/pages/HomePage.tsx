import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import * as Separator from '@radix-ui/react-separator';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';

export function HomePage() {
    const { isSignedIn } = useUser();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                            Welcome to <span className="text-purple-600 dark:text-purple-400">lesbian.quest</span>
                        </h2>
                        <p className="mt-6 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Your inclusive space for connection, community, and celebration.
                        </p>
                    </motion.div>

                    <div className="mt-16">
                        <Separator.Root className="bg-purple-200 dark:bg-purple-800 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full" />
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Connect',
                                description: 'Meet like-minded individuals and form meaningful connections.',
                                icon: '👥',
                            },
                            {
                                title: 'Share',
                                description: 'Share your stories, experiences, and create lasting memories.',
                                icon: '💝',
                            },
                            {
                                title: 'Grow',
                                description: 'Be part of a supportive community that celebrates diversity.',
                                icon: '🌈',
                            },
                        ].map((feature) => (
                            <motion.div
                                key={feature.title}
                                whileHover={{ scale: 1.05 }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
} 