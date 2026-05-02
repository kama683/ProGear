import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Star, CreditCard, Check } from 'lucide-react';
import { deleteCard, setDefaultCard } from '../../api/cards';
import { useToast } from '../../hooks/useToast';
import type { PaymentCard } from '../../types/api';

interface Props {
  cards: PaymentCard[];
  selectable?: boolean;
  selectedId?: number | null;
  onSelect?: (card: PaymentCard) => void;
  showActions?: boolean;
}

function cardGradient(type: string): string {
  const g: Record<string, string> = {
    visa: 'linear-gradient(135deg, #1a1f71 0%, #2d6cdf 100%)',
    mastercard: 'linear-gradient(135deg, #1c1c1c 0%, #333 50%, #eb001b 100%)',
    amex: 'linear-gradient(135deg, #007bc1 0%, #00b4d8 100%)',
    discover: 'linear-gradient(135deg, #e65c00 0%, #f9d423 100%)',
    unknown: 'linear-gradient(135deg, #2c2c3e 0%, #4a4a6a 100%)',
  };
  return g[type] ?? g.unknown;
}

function CardTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX', discover: 'DISC' };
  return (
    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, opacity: 0.9 }}>
      {labels[type] ?? ''}
    </span>
  );
}

export function SavedCardsList({ cards, selectable, selectedId, onSelect, showActions = true }: Props) {
  const qc = useQueryClient();
  const { success, error: toastError } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cards'] }); success('Card removed'); setConfirmDelete(null); },
    onError: (err: Error) => toastError('Error', err.message),
  });

  const defaultMutation = useMutation({
    mutationFn: setDefaultCard,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cards'] }); success('Default card updated'); },
    onError: (err: Error) => toastError('Error', err.message),
  });

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
        <CreditCard size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>No saved cards</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>Add a card to pay for orders</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {cards.map(card => {
        const isSelected = selectedId === card.ID;
        return (
          <div
            key={card.ID}
            onClick={() => selectable && onSelect?.(card)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              cursor: selectable ? 'pointer' : 'default',
              background: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            {/* Mini card visual */}
            <div style={{
              width: 54, height: 36, borderRadius: 6, flexShrink: 0,
              background: cardGradient(card.CardType),
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
              justifyContent: 'space-between', padding: '5px 7px',
            }}>
              <CardTypeBadge type={card.CardType} />
              <div style={{ color: '#fff', fontSize: 9, fontFamily: 'monospace', letterSpacing: 1 }}>
                ••{card.LastFour}
              </div>
            </div>

            {/* Card info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  •••• •••• •••• {card.LastFour}
                </span>
                {card.IsDefault && (
                  <span style={{ fontSize: 10, background: 'var(--color-primary)', color: '#fff', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>
                    Default
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {card.CardholderName} · {String(card.ExpiryMonth).padStart(2, '0')}/{String(card.ExpiryYear).slice(-2)}
              </div>
            </div>

            {/* Selected check */}
            {selectable && (
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}>
                {isSelected && <Check size={13} color="#fff" />}
              </div>
            )}

            {/* Actions */}
            {showActions && !selectable && (
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {!card.IsDefault && (
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    title="Set as default"
                    disabled={defaultMutation.isPending}
                    onClick={() => defaultMutation.mutate(card.ID)}
                  >
                    <Star size={14} />
                  </button>
                )}
                {confirmDelete === card.ID ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--color-danger)', color: '#fff', padding: '3px 10px', fontSize: 12 }}
                      onClick={() => deleteMutation.mutate(card.ID)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    title="Remove card"
                    onClick={() => setConfirmDelete(card.ID)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
