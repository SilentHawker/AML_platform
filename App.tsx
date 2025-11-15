
import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import AppContent from './components/AppContent';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

export default App;