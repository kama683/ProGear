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
      setError('Please fill in all fields'); return;
    }
    if (form.Password !== form.ConfirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (form.Password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    setLoading(true); setError('');
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        <Alert type="success" className="mb-4">Account created! Redirecting to login…</Alert>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <div className="auth-logo-text">Pro<span className="auth-logo-accent">Gear</span></div>
        <div className="auth-logo-sub">Equipment Rental & Sales</div>
      </div>

      <div className="auth-title">Create Account</div>
      <div className="auth-subtitle">Sign up for a new account</div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label required">Full Name</label>
          <input type="text" className="form-input" placeholder="John Smith"
            value={form.Name} onChange={e => update('Name', e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label required">Email</label>
          <input type="email" className="form-input" placeholder="your@email.com"
            value={form.Email} onChange={e => update('Email', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={form.Password} onChange={e => update('Password', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">Confirm Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={form.ConfirmPassword} onChange={e => update('ConfirmPassword', e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <Spinner size="sm" white /> : null}
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>

      <div className="auth-footer">
        Already have an account?{' '}
        <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
}
