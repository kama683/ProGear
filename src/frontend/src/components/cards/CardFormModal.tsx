import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Lock } from 'lucide-react';
import { addCard } from '../../api/cards';
import { useToast } from '../../hooks/useToast';
import { Alert } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (cardId: number) => void;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function detectType(num: string): string {
  const d = num.replace(/\s/g, '');
  if (d.startsWith('4')) return 'visa';
  if (d.startsWith('5')) return 'mastercard';
  if (d.startsWith('3')) return 'amex';
  if (d.startsWith('6')) return 'discover';
  return 'unknown';
}

function CardTypeIcon({ type }: { type: string }) {
  const style: React.CSSProperties = { fontSize: 13, fontWeight: 800, letterSpacing: 1, padding: '2px 8px', borderRadius: 4 };
  if (type === 'visa') return <span style={{ ...style, background: '#1a1f71', color: '#fff' }}>VISA</span>;
  if (type === 'mastercard') return (
    <span style={{ display: 'flex', gap: 0 }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#eb001b', display: 'inline-block' }} />
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#f79e1b', display: 'inline-block', marginLeft: -10, opacity: 0.9 }} />
    </span>
  );
  if (type === 'amex') return <span style={{ ...style, background: '#007bc1', color: '#fff' }}>AMEX</span>;
  if (type === 'discover') return <span style={{ ...style, background: '#e65c00', color: '#fff' }}>DISC</span>;
  return <CreditCard size={20} color="rgba(255,255,255,0.5)" />;
}

export function CardFormModal({ open, onClose, onSuccess }: Props) {
  const qc = useQueryClient();
  const { success, error: toastError } = useToast();

  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [setDefault, setSetDefault] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [formError, setFormError] = useState('');

  const cardType = detectType(cardNumber);
  const expiryDisplay = expiry || 'MM/YY';
  const nameDisplay = cardholderName.trim() || 'YOUR NAME';

  const mutation = useMutation({
    mutationFn: () => {
      const digits = cardNumber.replace(/\s/g, '');
      const [monthStr, yearStr] = expiry.split('/');
      const month = parseInt(monthStr, 10);
      const year = parseInt(`20${yearStr}`, 10);
      return addCard({
        CardNumber: digits,
        CardholderName: cardholderName.trim(),
        ExpiryMonth: month,
        ExpiryYear: year,
        CVV: cvv,
        SetDefault: setDefault,
      });
    },
    onSuccess: (card) => {
      qc.invalidateQueries({ queryKey: ['cards'] });
      success('Card added!', `••••  ${card.LastFour}`);
      handleClose();
      onSuccess?.(card.ID);
    },
    onError: (err: Error) => {
      setFormError(err.message);
      toastError('Error', err.message);
    },
  });

  function handleClose() {
    setCardNumber(''); setCardholderName(''); setExpiry(''); setCvv('');
    setSetDefault(false); setFormError(''); setFlipped(false);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 13) { setFormError('Enter a valid card number (13–16 digits)'); return; }
    if (!cardholderName.trim()) { setFormError('Enter cardholder name'); return; }
    if (expiry.length < 5) { setFormError('Enter expiry date (MM/YY)'); return; }
    const [mm] = expiry.split('/');
    if (parseInt(mm, 10) < 1 || parseInt(mm, 10) > 12) { setFormError('Invalid expiry month'); return; }
    if (cvv.length < 3) { setFormError('Enter 3-digit CVV'); return; }
    mutation.mutate();
  }

  // Gradient by card type
  const cardGradient: Record<string, string> = {
    visa: 'linear-gradient(135deg, #1a1f71 0%, #2d6cdf 100%)',
    mastercard: 'linear-gradient(135deg, #1c1c1c 0%, #333 50%, #eb001b 100%)',
    amex: 'linear-gradient(135deg, #007bc1 0%, #00b4d8 100%)',
    discover: 'linear-gradient(135deg, #e65c00 0%, #f9d423 100%)',
    unknown: 'linear-gradient(135deg, #2c2c3e 0%, #4a4a6a 100%)',
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Payment Card" subtitle="Card info is simulated — no real charges" size="md">
      {/* Visual card preview */}
      <div style={{ perspective: 1000, marginBottom: 24, cursor: 'pointer' }} onClick={() => setFlipped(f => !f)}>
        <div style={{
          position: 'relative', width: '100%', height: 190,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0,
            background: cardGradient[cardType] ?? cardGradient.unknown,
            borderRadius: 16, padding: '24px 28px',
            backfaceVisibility: 'hidden', color: '#fff',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Chip */}
              <div style={{ width: 40, height: 30, borderRadius: 6, background: 'rgba(255,215,0,0.85)', border: '1px solid rgba(255,215,0,0.4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 2, padding: 4 }}>
                {[0,1,2,3].map(i => <div key={i} style={{ background: 'rgba(200,160,0,0.6)', borderRadius: 2 }} />)}
              </div>
              <CardTypeIcon type={cardType} />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 3, marginBottom: 16, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                {cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2, letterSpacing: 1 }}>CARD HOLDER</div>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{nameDisplay}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2, letterSpacing: 1 }}>EXPIRES</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{expiryDisplay}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0,
            background: cardGradient[cardType] ?? cardGradient.unknown,
            borderRadius: 16, backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            <div style={{ width: '100%', height: 44, background: '#111', marginTop: 28 }} />
            <div style={{ padding: '14px 28px' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '8px 12px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: '#fff', color: '#333', borderRadius: 4, padding: '4px 14px', fontSize: 16, fontFamily: 'monospace', letterSpacing: 2, minWidth: 54, textAlign: 'center' }}>
                  {cvv || '•••'}
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 8, textAlign: 'right' }}>CVV</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
          Click card to see back side
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {formError && <Alert type="error" className="mb-4">{formError}</Alert>}

        <div className="form-group">
          <label className="form-label required">Card Number</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text" className="form-input" placeholder="0000 0000 0000 0000"
              inputMode="numeric" maxLength={19}
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              style={{ paddingRight: 48, fontFamily: 'monospace', letterSpacing: 2 }}
            />
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <CardTypeIcon type={cardType} />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label required">Cardholder Name</label>
          <input
            type="text" className="form-input" placeholder="JOHN DOE"
            value={cardholderName}
            onChange={e => setCardholderName(e.target.value.toUpperCase())}
            style={{ textTransform: 'uppercase', letterSpacing: 1 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label required">Expiry Date</label>
            <input
              type="text" className="form-input" placeholder="MM/YY"
              inputMode="numeric" maxLength={5}
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              style={{ fontFamily: 'monospace', letterSpacing: 2 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label required" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lock size={12} /> CVV
            </label>
            <input
              type="text" className="form-input" placeholder="•••"
              inputMode="numeric" maxLength={4}
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              style={{ fontFamily: 'monospace', letterSpacing: 4 }}
            />
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox" id="set-default"
            checked={setDefault}
            onChange={e => setSetDefault(e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="set-default" style={{ fontSize: 14, cursor: 'pointer', color: 'var(--color-text)' }}>
            Set as default payment card
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner size="sm" white /> : null}
            {mutation.isPending ? 'Saving...' : 'Add Card'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
