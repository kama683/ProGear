import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ Name: '', Email: '', Password: '', ConfirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.Name || !form.Email || !form.Password || !form.ConfirmPassword) {
      setError('Заполните все поля'); return;
    }
    if (form.Password !== form.ConfirmPassword) {
      setError('Пароли не совпадают'); return;
    }
    if (form.Password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов'); return;
    }
    setLoading(true); setError('');
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">
          <div className="auth-logo-text">Pro<span className="auth-logo-accent">Gear</span></div>
        </div>
        <Alert type="success" className="mb-4">Аккаунт создан! Переход на страницу входа…</Alert>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <div className="auth-logo-text">Pro<span className="auth-logo-accent">Gear</span></div>
        <div className="auth-logo-sub">Аренда и продажа оборудования</div>
      </div>

      <div className="auth-title">Регистрация</div>
      <div className="auth-subtitle">Создайте новый аккаунт</div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label required">Имя</label>
          <input type="text" className="form-input" placeholder="Иван Иванов"
            value={form.Name} onChange={e => update('Name', e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label required">Email</label>
          <input type="email" className="form-input" placeholder="your@email.com"
            value={form.Email} onChange={e => update('Email', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">Пароль</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={form.Password} onChange={e => update('Password', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">Повторите пароль</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={form.ConfirmPassword} onChange={e => update('ConfirmPassword', e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <Spinner size="sm" white /> : null}
            {loading ? 'Создание...' : 'Создать аккаунт'}
          </button>
        </div>
      </form>

      <div className="auth-footer">
        Уже есть аккаунт?{' '}
        <Link to="/login">Войти</Link>
      </div>
    </div>
  );
}
