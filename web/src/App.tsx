import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { MyAdventuresPage } from './pages/MyAdventuresPage';
import { EditAdventurePage } from './pages/EditAdventurePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SWRProvider } from './lib/swr';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider } from './components/Toast';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

function App() {
  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={clerkPubKey}>
        <SWRProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/my-adventures" element={<MyAdventuresPage />} />
                <Route path="/adventure/:adventureId/edit" element={<EditAdventurePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </ToastProvider>
        </SWRProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;
