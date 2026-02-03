
import React, { useState, useEffect } from 'react';
import { Participant, Prize, WinnerRecord, ParticipantStatus, AppState } from './types';
import PublicCheck from './pages/PublicCheck';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';

const INITIAL_STATE: AppState = {
  participants: [],
  prizes: [],
  winners: [],
  isLoggedIn: false
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('luckyDrawState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isLoggedIn: false }; // Always reset login on refresh for security
    }
    return INITIAL_STATE;
  });

  const [currentPage, setCurrentPage] = useState<'public' | 'login' | 'dashboard'>('public');

  useEffect(() => {
    localStorage.setItem('luckyDrawState', JSON.stringify(state));
  }, [state]);

  const handleLogin = (success: boolean) => {
    if (success) {
      setState(prev => ({ ...prev, isLoggedIn: true }));
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, isLoggedIn: false }));
    setCurrentPage('public');
  };

  // State update helpers
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        currentPage={currentPage} 
        isLoggedIn={state.isLoggedIn}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {currentPage === 'public' && (
          <PublicCheck participants={state.participants} winners={state.winners} />
        )}
        
        {currentPage === 'login' && (
          <Login onLogin={handleLogin} />
        )}
        
        {currentPage === 'dashboard' && state.isLoggedIn && (
          <Dashboard state={state} updateState={updateState} />
        )}

        {currentPage === 'dashboard' && !state.isLoggedIn && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">Please login as admin to access this area.</p>
            <button 
              onClick={() => setCurrentPage('login')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Login
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        <p>&copy; 2026 LuckyDraw System. Admin Password: adminbc2026</p>
      </footer>
    </div>
  );
};

export default App;
