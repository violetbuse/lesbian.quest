import { ClerkProvider } from '@clerk/clerk-react';
import { HomePage } from './components/HomePage';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <HomePage />
    </ClerkProvider>
  );
}

export default App;
