import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';

export function Navbar() {
  const { isSignedIn } = useUser();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-8"
          >
            <Link to="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              lesbian.quest
            </Link>
            {isSignedIn && (
              <Link
                to="/my-adventures"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
              >
                My Adventures
              </Link>
            )}
          </motion.div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 