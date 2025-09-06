import React, { useState } from 'react';
import { LoginScreen } from '@/components/auth/LoginScreen';

export default function AuthModal() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <LoginScreen 
      isSignUp={isSignUp}
      onToggleMode={() => setIsSignUp(!isSignUp)}
    />
  );
}