import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';


// Pages
import HomeScreen from './pages/HomeScreen';
import AuthPage from './pages/AuthPage';
import AuthCallback from "./pages/AuthCallback";
import OtpVerificationPage from './pages/OtpVerificationPage';
import Profile from './pages/Profile';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import Dictionary from './pages/Dictionary';
import Leaderboards from './pages/Leaderboards';
import InvalidRouteHandler from './pages/InvalidRouteHandler';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const quizLocation = location.pathname.includes('/quiz');
  const { pathname } = location;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const loggedIn = !!user;
  const userRole = user?.role;

  return (
    <>
      {loggedIn && !quizLocation && userRole === 'user' && <Sidebar />}
      
      <div
        className={`overflow-x-hidden overflow-y-auto flex flex-col ${
          loggedIn && userRole === 'user' 
            ? (quizLocation ? '' : 'mb-20 sm:mb-0 sm:ms-[88px] xl:ms-[300px]') 
            : ''
        }`}
      >
        {!loggedIn && <Header />}
        
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/otp/verify" element={<OtpVerificationPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* User Routes - Only show if not admin */}
            {userRole !== 'admin' && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leaderboards" element={<Leaderboards />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dictionary" element={<Dictionary />} />
                
                {/* Quiz Routes - Simplified for now */}
                <Route path="/quiz/*" element={<QuizPage />} />
              </>
            )}

            {/* Admin Routes - Protected */}
            {loggedIn && userRole === 'admin' && (
              <Route path="/adminPanel/*" element={<AdminPanel />} />
            )}

            {/* Fallback for invalid routes */}
            <Route path="*" element={<InvalidRouteHandler />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

// Root App component with single Router
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}