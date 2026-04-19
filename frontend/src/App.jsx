import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { doctor, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} className="animate-spin-slow" style={{ color: 'var(--color-neon)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Neural Handshake...</p>
        </div>
      </div>
    );
  }

  return doctor ? <div className="dashboard-transition"><Dashboard /></div> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}