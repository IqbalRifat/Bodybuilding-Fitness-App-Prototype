import React from 'react';
import { useAuth } from './AuthProvider';
import { LoginScreen } from './LoginScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = React.useState(false);

  if (loading) {
    return null; // Or a loading spinner component
  }

  if (!user) {
    return (
      <LoginScreen 
        isSignUp={isSignUp}
        onToggleMode={() => setIsSignUp(!isSignUp)}
      />
    );
  }

  return <>{children}</>;
}