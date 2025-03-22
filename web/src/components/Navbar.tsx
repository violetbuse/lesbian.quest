import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <h1 className="text-2xl font-bold text-purple-600">lesbian.quest</h1>
          </motion.div>
          <div className="flex items-center gap-4">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-500">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500">
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