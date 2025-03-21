import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import { RequireAuth } from './components/AuthProvider';
import Home from './pages/Home';
import Adventures from './pages/Adventures';
import AdventureDetail from './pages/AdventureDetail';
import AdventurePlay from './pages/AdventurePlay';
import AdventureComplete from './pages/AdventureComplete';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="adventures" element={<Adventures />} />
                <Route path="adventures/:id" element={<AdventureDetail />} />
                <Route
                  path="adventures/:id/play/:sceneId"
                  element={
                    <RequireAuth>
                      <AdventurePlay />
                    </RequireAuth>
                  }
                />
                <Route
                  path="adventures/:id/complete"
                  element={
                    <RequireAuth>
                      <AdventureComplete />
                    </RequireAuth>
                  }
                />
                <Route path="sign-in/*" element={<SignIn />} />
                <Route path="sign-up/*" element={<SignUp />} />
              </Route>
            </Routes>
          </Router>
        </ChakraProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
