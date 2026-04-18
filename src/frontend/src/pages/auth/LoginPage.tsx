import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../api/auth';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Заполните все поля'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await login({ Email: email, Password: password });
      setUser(res.User);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <div className="auth-logo-text">Pro<span className="auth-logo-accent">Gear</span></div>
        <div className="auth-logo-sub">Аренда и продажа оборудования</div>
      </div>

      <div className="auth-title">Добро пожаловать</div>
      <div className="auth-subtitle">Войдите в свой аккаунт</div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label required">Email</label>
          <input
            type="email" className="form-input"
            placeholder="your@email.com"
            value={email} onChange={e => setEmail(e.target.value)}
            autoComplete="email" autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label required">Пароль</label>
          <input
            type="password" className="form-input"
            placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? <Spinner size="sm" white /> : null}
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <div className="auth-footer">
        Нет аккаунта?{' '}
        <Link to="/register">Зарегистрироваться</Link>
      </div>
    </div>
  );
}
