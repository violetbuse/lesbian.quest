import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout.js';
import Home from './pages/Home.js';
import Adventures from './pages/Adventures.js';
import AdventureDetail from './pages/AdventureDetail';
import AdventurePlay from './pages/AdventurePlay';
import AdventureComplete from './pages/AdventureComplete';

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
                <Route path="adventures/:id/play/:sceneId" element={<AdventurePlay />} />
                <Route path="adventures/:id/complete" element={<AdventureComplete />} />
              </Route>
            </Routes>
          </Router>
        </ChakraProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
