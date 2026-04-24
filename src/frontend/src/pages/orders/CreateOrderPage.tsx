import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { listEquipment } from '../../api/equipment';
import { createOrder } from '../../api/orders';
import { useToast } from '../../hooks/useToast';
import { LoadingCenter, Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { formatCurrency, toLocalDatetimeInput, getEquipmentTypeLabel } from '../../utils/format';
import type { CreateOrderItemRequest, ItemType } from '../../types/api';

interface OrderItem extends CreateOrderItemRequest {
  _key: number;
  equipmentName?: string;
}

let itemKey = 0;

export function CreateOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();

  const state = location.state as { reservationId?: number; equipmentId?: number } | null;

  const [items, setItems] = useState<OrderItem[]>(() => {
    if (state?.reservationId && state?.equipmentId) {
      return [{ _key: ++itemKey, ItemType: 'rental', EquipmentID: state.equipmentId, Quantity: 1, ReservationID: state.reservationId }];
    }
    return [{ _key: ++itemKey, ItemType: 'rental', EquipmentID: 0, Quantity: 1 }];
  });
  const [submitError, setSubmitError] = useState('');

  const { data: equipment = [], isLoading } = useQuery<import('../../types/api').Equipment[]>({
    queryKey: ['equipment'],
    queryFn: () => listEquipment(),
  });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      success('Order created!', `Order #${order.ID} placed`);
      navigate(`/orders/${order.ID}`);
    },
    onError: (err: Error) => { setSubmitError(err.message); toastError('Error', err.message); },
  });

  function addItem() {
    setItems(prev => [...prev, { _key: ++itemKey, ItemType: 'rental', EquipmentID: 0, Quantity: 1 }]);
  }

  function removeItem(key: number) {
    setItems(prev => prev.filter(i => i._key !== key));
  }

  function updateItem(key: number, patch: Partial<OrderItem>) {
    setItems(prev => prev.map(i => i._key === key ? { ...i, ...patch } : i));
  }

  const totalAmount = items.reduce((sum, item) => {
    const eq = equipment.find(e => e.ID === item.EquipmentID);
    if (!eq) return sum;
    const price = item.ItemType === 'rental' ? parseFloat(eq.DailyRate) || 0 : parseFloat(eq.SalePrice) || 0;
    return sum + price * item.Quantity;
  }, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    if (items.length === 0) { setSubmitError('Add at least one item'); return; }
    for (const item of items) {
      if (!item.EquipmentID) { setSubmitError('Select equipment for each item'); return; }
      if (item.ItemType === 'rental' && !item.ReservationID && (!item.StartAt || !item.EndAt)) {
        setSubmitError('Specify dates for rentals without a booking'); return;
      }
    }

    const req = items.map(({ _key, equipmentName, ...rest }) => {
      void _key; void equipmentName;
      return {
        ...rest,
        StartAt: rest.StartAt ? new Date(rest.StartAt).toISOString() : undefined,
        EndAt: rest.EndAt ? new Date(rest.EndAt).toISOString() : undefined,
      };
    });

    mutation.mutate({ Items: req });
  }

  if (isLoading) return <LoadingCenter />;

  const now = toLocalDatetimeInput(new Date());

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/orders')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="page-title">Create Order</div>
            <div className="page-subtitle">Add items and place your order</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {submitError && <Alert type="error" className="mb-4">{submitError}</Alert>}

        <div className="card mb-4">
          <div className="card-header">
            <span className="card-title">Order Items</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map((item, idx) => {
              const eq = equipment.find(e => e.ID === item.EquipmentID);
              const canRent = !eq || eq.Type === 'rental' || eq.Type === 'both';
              const canSell = !eq || eq.Type === 'sale' || eq.Type === 'both';

              return (
                <div key={item._key} style={{ border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Item {idx + 1}</span>
                    {items.length > 1 && (
                      <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => removeItem(item._key)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label required">Equipment</label>
                      <select
                        className="form-input form-select"
                        value={item.EquipmentID || ''}
                        onChange={e => updateItem(item._key, { EquipmentID: Number(e.target.value), ItemType: 'rental' })}
                      >
                        <option value="">Select...</option>
                        {equipment.map(e => (
                          <option key={e.ID} value={e.ID}>{e.Name} ({getEquipmentTypeLabel(e.Type)})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label required">Type</label>
                      <select
                        className="form-input form-select"
                        value={item.ItemType}
                        onChange={e => updateItem(item._key, { ItemType: e.target.value as ItemType })}
                      >
                        {canRent && <option value="rental">Rental</option>}
                        {canSell && <option value="sale">Purchase</option>}
                      </select>
                    </div>
                  </div>

                  <div className="form-row mt-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label required">Quantity</label>
                      <input type="number" className="form-input" min="1" value={item.Quantity}
                        onChange={e => updateItem(item._key, { Quantity: Number(e.target.value) })} />
                    </div>
                    {item.ItemType === 'rental' && !item.ReservationID && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Booking ID (if any)</label>
                        <input type="number" className="form-input" placeholder="Optional"
                          onChange={e => updateItem(item._key, { ReservationID: e.target.value ? Number(e.target.value) : undefined })} />
                      </div>
                    )}
                    {item.ReservationID && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Booking ID</label>
                        <div style={{ padding: '9px 12px', background: 'var(--color-success-light)', border: '1.5px solid var(--color-success-border)', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600 }}>
                          #{item.ReservationID}
                        </div>
                      </div>
                    )}
                  </div>

                  {item.ItemType === 'rental' && !item.ReservationID && (
                    <div className="form-row mt-2">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Rental Start</label>
                        <input type="datetime-local" className="form-input" min={now}
                          value={item.StartAt ?? ''} onChange={e => updateItem(item._key, { StartAt: e.target.value || undefined })} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Rental End</label>
                        <input type="datetime-local" className="form-input" min={item.StartAt ?? now}
                          value={item.EndAt ?? ''} onChange={e => updateItem(item._key, { EndAt: e.target.value || undefined })} />
                      </div>
                    </div>
                  )}

                  {eq && (
                    <div className="mt-2 text-sm text-muted">
                      {item.ItemType === 'rental' && (eq.Type === 'rental' || eq.Type === 'both') && (
                        <span>Rental: <strong>{formatCurrency(eq.DailyRate)}/day</strong></span>
                      )}
                      {item.ItemType === 'sale' && (eq.Type === 'sale' || eq.Type === 'both') && (
                        <span>Price: <strong>{formatCurrency(eq.SalePrice)}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="text-muted text-sm">Estimated Amount</div>
              <div className="price-large">{formatCurrency(totalAmount)}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/orders')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner size="sm" white /> : null}
                {mutation.isPending ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
