import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';
import { updateProfile } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';

// Formats digits into +7 (XXX) XXX-XX-XX
function formatKzPhone(digits: string): string {
  const d = digits.slice(0, 10);
  let result = '+7';
  if (d.length === 0) return result;
  if (d.length <= 3) return `+7 (${d}`;
  if (d.length <= 6) return `+7 (${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length <= 8) return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
}

function extractDigits(value: string): string {
  // Remove +7 prefix and all non-digits
  return value.replace(/^\+7/, '').replace(/\D/g, '');
}

function isPhoneComplete(digits: string): boolean {
  return digits.length === 10;
}

export function CompleteProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [phoneDigits, setPhoneDigits] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = extractDigits(e.target.value);
    setPhoneDigits(digits.slice(0, 10));
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && phoneDigits.length === 0) {
      e.preventDefault();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPhoneTouched(true);

    if (!isPhoneComplete(phoneDigits)) {
      setError('Enter a valid phone number: +7 (XXX) XXX-XX-XX');
      return;
    }
    if (!address.trim()) {
      setError('Please enter your residential address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const fullPhone = `+7${phoneDigits}`;
      const updated = await updateProfile({ Phone: fullPhone, Address: address.trim() });
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  const phoneDisplay = formatKzPhone(phoneDigits);
  const phoneInvalid = phoneTouched && !isPhoneComplete(phoneDigits);

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <div className="auth-logo-text">Pro<span className="auth-logo-accent">Gear</span></div>
        <div className="auth-logo-sub">Equipment Rental & Sales</div>
      </div>

      <div className="auth-title">Complete Your Profile</div>
      <div className="auth-subtitle">
        Welcome, <strong>{user?.Name}</strong>! Please add your contact details to continue.
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
            className={`form-input${phoneInvalid ? ' error' : ''}`}
            value={phoneDisplay}
            onChange={handlePhoneChange}
            onKeyDown={handlePhoneKeyDown}
            onBlur={() => setPhoneTouched(true)}
            placeholder="+7 (___) ___-__-__"
            autoFocus
            autoComplete="tel"
          />
          {phoneInvalid && (
            <div className="form-error">Enter all 10 digits after +7</div>
          )}
          <div className="form-hint">Kazakhstan number: +7 (XXX) XXX-XX-XX</div>
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
