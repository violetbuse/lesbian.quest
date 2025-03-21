import { useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: AuthProviderProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
}

export function RedirectIfSignedIn({ children }: AuthProviderProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Navigate to={from} replace />;
  }

  return children;
} 