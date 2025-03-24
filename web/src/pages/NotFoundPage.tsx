import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';

export function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                    >
                        <h1 className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-4">404</h1>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Page Not Found</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900"
                        >
                            Return Home
                        </Link>
                    </motion.div>
                </div>
            </main>
        </div>
    );
} 