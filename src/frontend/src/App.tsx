import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { EquipmentList } from './components/EquipmentList';

type AuthPage = 'login' | 'register';

function AppContent() {
  const { user } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>('login');

  if (user) {
    return <EquipmentList />;
  }

  if (authPage === 'register') {
    return <RegisterForm onLogin={() => setAuthPage('login')} />;
  }

  return <LoginForm onRegister={() => setAuthPage('register')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}