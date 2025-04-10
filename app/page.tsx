import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Create Your Own Adventure
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Write, share, and explore interactive stories where every choice matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Create a Story
            </Link>
            <Link
              href="/explore"
              className="bg-white hover:bg-gray-100 text-purple-600 font-semibold py-3 px-6 rounded-lg transition-colors border border-purple-600"
            >
              Explore Stories
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-purple-600 dark:text-purple-400 text-2xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Create Stories</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Build branching narratives with our intuitive story editor. Add choices, consequences, and multiple endings.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-purple-600 dark:text-purple-400 text-2xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Share & Explore</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Share your stories with the community and discover amazing adventures created by others.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-purple-600 dark:text-purple-400 text-2xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Interactive Reading</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Experience stories where your choices shape the narrative. Every decision leads to a unique path.
            </p>
          </div>
        </div>

        {/* Featured Stories Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Featured Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Story Card 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">The Enchanted Forest</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">A magical journey through a mysterious forest where every choice could be your last.</p>
                <Link
                  href="/stories/enchanted-forest"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Read Story →
                </Link>
              </div>
            </div>
            {/* Story Card 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Space Odyssey</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Navigate through the cosmos, making decisions that will determine the fate of your crew.</p>
                <Link
                  href="/stories/space-odyssey"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Read Story →
                </Link>
              </div>
            </div>
            {/* Story Card 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Detective's Choice</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Solve a mysterious crime where your investigative skills and choices lead to different outcomes.</p>
                <Link
                  href="/stories/detectives-choice"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Read Story →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Ready to Start Your Adventure?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join our community of storytellers and readers today.
          </p>
          <Link
            href="/signup"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
