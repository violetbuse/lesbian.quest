import React from 'react';
import { SWRConfig, SWRConfiguration } from 'swr';
import { ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';

// Create a custom hook for authenticated fetching
function useAuthenticatedFetcher() {
  const { getToken } = useAuth();

  return async (url: string) => {
    const token = await getToken();
    console.log({token})
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('An error occurred while fetching the data.');
    }
    
    return response.json();
  };
}

// Create a wrapper component that provides the authenticated fetcher
function AuthenticatedSWRConfig({ children }: { children: ReactNode }) {
  const fetcher = useAuthenticatedFetcher();
  
  const config: SWRConfiguration = {
    fetcher,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 1000
  };

  return (
    <SWRConfig value={config}>
      {children}
    </SWRConfig>
  );
}

export function SWRProvider({ children }: { children: ReactNode }) {
  return <AuthenticatedSWRConfig>{children}</AuthenticatedSWRConfig>;
} 