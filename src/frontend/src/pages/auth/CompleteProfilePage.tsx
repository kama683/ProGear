import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';
import { updateProfile } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';

export function CompleteProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !address.trim()) {
      setError('Please fill in both fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const updated = await updateProfile({ Phone: phone.trim(), Address: address.trim() });
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...parsed, Phone: updated.Phone, Address: updated.Address }));
      }
      setUser({ ...user, Phone: updated.Phone, Address: updated.Address });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <div className="auth-logo-text">Pro<span className="auth-logo-accent">Gear</span></div>
        <div className="auth-logo-sub">Equipment Rental & Sales</div>
      </div>

      <div className="auth-title">Complete Your Profile</div>
      <div className="auth-subtitle">
        Welcome, <strong>{user.Name}</strong>! Please add your contact details to continue.
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label required">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={14} /> Phone Number
            </span>
          </label>
          <input
            type="tel"
            className="form-input"
            placeholder="+998 90 123 45 67"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label required">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} /> Residential Address
            </span>
          </label>
          <textarea
            className="form-input"
            placeholder="City, Street, Building, Apartment"
            rows={3}
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? <Spinner size="sm" white /> : null}
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </form>

      <div className="auth-footer">
        <button
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 13 }}
          onClick={() => { logout(); navigate('/login'); }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
