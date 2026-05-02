import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, ShoppingBag, ArrowRight, CreditCard, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../api/orders';
import { listCards } from '../../api/cards';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, toLocalDatetimeInput } from '../../utils/format';
import { Spinner } from '../ui/Spinner';
import { CardFormModal } from '../cards/CardFormModal';
import { SavedCardsList } from '../cards/SavedCardsList';
import type { PaymentCard } from '../../types/api';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateItem, clearCart, totalItems } = useCart();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();
  const now = toLocalDatetimeInput(new Date());

  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);

  const { data: cards = [] } = useQuery({
    queryKey: ['cards'],
    queryFn: listCards,
    enabled: isOpen,
  });

  const defaultCard = cards.find(c => c.IsDefault) ?? cards[0] ?? null;
  const activeCard = selectedCard ?? defaultCard;

  const totalAmount = items.reduce((sum, item) => {
    const price = item.itemType === 'rental' ? parseFloat(item.dailyRate) || 0 : parseFloat(item.salePrice) || 0;
    return sum + price * item.quantity;
  }, 0);

  const mutation = useMutation({
    mutationFn: () => {
      const reqItems = items.map(item => ({
        ItemType: item.itemType,
        EquipmentID: item.equipmentId,
        Quantity: item.quantity,
        StartAt: item.startAt ? new Date(item.startAt).toISOString() : undefined,
        EndAt: item.endAt ? new Date(item.endAt).toISOString() : undefined,
      }));
      return createOrder({ Items: reqItems });
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      success('Order placed!', `Order #${order.ID} created`);
      clearCart();
      closeCart();
      navigate(`/orders/${order.ID}`);
    },
    onError: (err: Error) => toastError('Error', err.message),
  });

  function handleCheckout() {
    for (const item of items) {
      if (item.itemType === 'rental' && (!item.startAt || !item.endAt)) {
        toastError('Dates required', `Set rental dates for "${item.equipmentName}"`);
        return;
      }
    }
    if (!activeCard) {
      setAddCardOpen(true);
      return;
    }
    mutation.mutate();
  }

  function handleCardAdded(cardId: number) {
    qc.invalidateQueries({ queryKey: ['cards'] }).then(() => {
      const found = cards.find(c => c.ID === cardId);
      if (found) setSelectedCard(found);
    });
  }

  const cardGradient: Record<string, string> = {
    visa: 'linear-gradient(90deg, #1a1f71 0%, #2d6cdf 100%)',
    mastercard: 'linear-gradient(90deg, #1c1c1c 0%, #eb001b 100%)',
    amex: 'linear-gradient(90deg, #007bc1 0%, #00b4d8 100%)',
    discover: 'linear-gradient(90deg, #e65c00 0%, #f9d423 100%)',
    unknown: 'linear-gradient(90deg, #2c2c3e 0%, #4a4a6a 100%)',
  };

  return (
    <>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }}
          onClick={closeCart}
        />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw',
        background: 'var(--color-surface)', boxShadow: '-4px 0 32px rgba(0,0,0,0.15)',
        zIndex: 201, transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={18} color="var(--color-primary)" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Cart</span>
            {totalItems > 0 && (
              <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>
                {totalItems}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {items.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Clear all
              </button>
            )}
            <button className="btn btn-ghost btn-icon btn-sm" onClick={closeCart}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
              <ShoppingBag size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div style={{ fontSize: 15, fontWeight: 600 }}>Your cart is empty</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Browse equipment and add items</div>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{ border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.equipmentName}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.category}</div>
                </div>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeItem(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: item.itemType === 'rental' ? 10 : 0 }}>
                <select
                  className="form-input form-select"
                  style={{ flex: 1, fontSize: 13, padding: '5px 8px' }}
                  value={item.itemType}
                  onChange={e => updateItem(item.id, { itemType: e.target.value as 'rental' | 'sale' })}
                >
                  <option value="rental">Rental</option>
                  <option value="sale">Purchase</option>
                </select>
                <input
                  type="number" min="1" className="form-input"
                  style={{ width: 64, fontSize: 13, padding: '5px 8px' }}
                  value={item.quantity}
                  onChange={e => updateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })}
                />
              </div>

              {item.itemType === 'rental' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Start</div>
                    <input type="datetime-local" className="form-input" min={now}
                      style={{ fontSize: 12, padding: '4px 8px' }}
                      value={item.startAt ?? ''}
                      onChange={e => updateItem(item.id, { startAt: e.target.value || undefined })}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>End</div>
                    <input type="datetime-local" className="form-input" min={item.startAt ?? now}
                      style={{ fontSize: 12, padding: '4px 8px' }}
                      value={item.endAt ?? ''}
                      onChange={e => updateItem(item.id, { endAt: e.target.value || undefined })}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'right' }}>
                {item.itemType === 'rental'
                  ? <>{formatCurrency(item.dailyRate)}<span style={{ fontWeight: 400 }}>/day × {item.quantity}</span></>
                  : <>{formatCurrency(item.salePrice)}<span style={{ fontWeight: 400 }}> × {item.quantity}</span></>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)' }}>
            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Estimated total</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>{formatCurrency(totalAmount)}</span>
            </div>

            {/* Payment card selector */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>Payment card</div>

              {activeCard ? (
                <div>
                  <button
                    onClick={() => setShowCardPicker(p => !p)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 'var(--radius)',
                      border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {/* Mini card chip */}
                    <div style={{
                      width: 40, height: 26, borderRadius: 4, flexShrink: 0,
                      background: cardGradient[activeCard.CardType] ?? cardGradient.unknown,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      padding: '0 5px',
                    }}>
                      <span style={{ color: '#fff', fontSize: 8, fontFamily: 'monospace' }}>••{activeCard.LastFour}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>•••• {activeCard.LastFour}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 12, marginLeft: 6 }}>
                        {String(activeCard.ExpiryMonth).padStart(2, '0')}/{String(activeCard.ExpiryYear).slice(-2)}
                      </span>
                    </div>
                    <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', transform: showCardPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {showCardPicker && (
                    <div style={{
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                      marginTop: 6, padding: 10, background: 'var(--color-surface)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    }}>
                      <SavedCardsList
                        cards={cards}
                        selectable
                        selectedId={activeCard.ID}
                        onSelect={c => { setSelectedCard(c); setShowCardPicker(false); }}
                        showActions={false}
                      />
                      <button
                        className="btn btn-ghost btn-sm btn-full"
                        style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
                        onClick={() => { setShowCardPicker(false); setAddCardOpen(true); }}
                      >
                        <CreditCard size={13} /> Add new card
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn-secondary btn-full"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
                  onClick={() => setAddCardOpen(true)}
                >
                  <CreditCard size={14} /> Add payment card
                </button>
              )}
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleCheckout}
              disabled={mutation.isPending}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {mutation.isPending ? <Spinner size="sm" white /> : <ArrowRight size={16} />}
              {mutation.isPending ? 'Placing order...' : activeCard ? `Pay with ••••${activeCard.LastFour}` : 'Place Order'}
            </button>
          </div>
        )}
      </div>

      <CardFormModal
        open={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        onSuccess={handleCardAdded}
      />
    </>
  );
}
