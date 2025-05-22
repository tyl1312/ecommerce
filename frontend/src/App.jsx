import { Routes, Route } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import AuthPage from './pages/AuthPage';
import AuthCallback from "./pages/AuthCallback";
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/user" element={<Profile />} />
      <Route path="/auth/callback" element={<AuthCallback />} /> 
    </Routes>
  );
}

export default App;