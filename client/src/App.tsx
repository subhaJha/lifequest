import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './contexts/useAuth';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CharacterProfile } from './pages/CharacterProfile';
import { Kingdom } from './pages/Kingdom';
import Game from './pages/Game';
import { NumberGuessingGame } from './components/NumberGuessingGame';


import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Protected Route Component

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
};

// Main Routes Component (inside AuthProvider)
const AppRoutes = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/forgot-password" element={isLoggedIn ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
      <Route path="/reset-password" element={isLoggedIn ? <Navigate to="/dashboard" /> : <ResetPassword />} />
<Route path="/games" element={<NumberGuessingGame />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/character"
        element={
          <ProtectedRoute>
            <CharacterProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kingdom"
        element={
          <ProtectedRoute>
            <Kingdom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <Game />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
          <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
