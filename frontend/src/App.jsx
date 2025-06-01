import { Routes, Route } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import AuthPage from './pages/AuthPage';
import AuthCallback from "./pages/AuthCallback";
import OtpVerificationPage from './pages/OtpVerificationPage';
import Profile from './pages/Profile';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/otp/verify" element={<OtpVerificationPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}

export default App;