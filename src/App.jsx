import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { isAuthenticated } = useAuth();

  // If authenticated, render the Dashboard matching the user's attached design
  if (isAuthenticated) {
    return (
      <ErrorBoundary>
        <DashboardView />
      </ErrorBoundary>
    );
  }

  // Otherwise render the Login Screen matching the login mockup
  return <LoginScreen />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

