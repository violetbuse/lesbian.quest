import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { MyAdventuresPage } from './pages/MyAdventuresPage';
import { SWRProvider } from './lib/swr';
import { ThemeProvider } from './components/ThemeProvider';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

function App() {
  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={clerkPubKey}>
        <SWRProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/my-adventures" element={<MyAdventuresPage />} />
            </Routes>
          </Router>
        </SWRProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;
