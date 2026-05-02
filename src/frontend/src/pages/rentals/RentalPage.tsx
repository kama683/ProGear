import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckCircle } from 'lucide-react';
import { listEquipment } from '../../api/equipment';
import { checkAvailability, calculateRental, bookRental } from '../../api/rentals';
import { createOrder } from '../../api/orders';
import { useToast } from '../../hooks/useToast';
import { LoadingCenter, Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { formatCurrency, formatDateTime, toLocalDatetimeInput } from '../../utils/format';
import type { AvailabilityResponse, CalculateResponse, BookingResponse } from '../../types/api';

export function RentalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { success } = useToast();
  const qc = useQueryClient();

  const state = location.state as { equipmentId?: number; startAt?: string; equipmentName?: string } | null;
  const now = new Date();

  const [equipmentId, setEquipmentId] = useState<string>(state?.equipmentId ? String(state.equipmentId) : '');
  const [startAt, setStartAt] = useState(state?.startAt ?? toLocalDatetimeInput(now));
  const [duration, setDuration] = useState(1);
  const [mode, setMode] = useState<'day' | 'hour'>('day');
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [calcResult, setCalcResult] = useState<CalculateResponse | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');

  function computeEndAt(): string {
    if (!startAt || duration <= 0) return '';
    const ms = duration * (mode === 'hour' ? 3_600_000 : 86_400_000);
    return new Date(new Date(startAt).getTime() + ms).toISOString();
  }

  const allEquipment = useQuery({ queryKey: ['equipment-all'], queryFn: () => listEquipment() });
  const rentalEquipment = allEquipment.data?.filter(e => e.Type === 'rental' || e.Type === 'both') ?? [];

  async function handleCheck() {
    if (!equipmentId || !startAt || duration <= 0) return;
    if (new Date(startAt) <= new Date()) {
      setCheckError('Rental start time cannot be in the past');
      return;
    }
    const endAtISO = computeEndAt();
    if (!endAtISO) return;
    setChecking(true); setCheckError(''); setAvailability(null); setCalcResult(null);
    try {
      const startISO = new Date(startAt).toISOString();
      const [avail, calc] = await Promise.all([
        checkAvailability(Number(equipmentId), startISO, endAtISO),
        calculateRental({ EquipmentId: Number(equipmentId), StartAt: startISO, EndAt: endAtISO, Mode: mode }),
      ]);
      setAvailability(avail); setCalcResult(calc);
    } catch (err: unknown) {
      setCheckError(err instanceof Error ? err.message : 'Check failed');
    } finally {
      setChecking(false);
    }
  }

  const bookMutation = useMutation({
    mutationFn: async (data: Parameters<typeof bookRental>[0]) => {
      const booking = await bookRental(data);
      const order = await createOrder({
        Items: [{
          ItemType: 'rental',
          EquipmentID: booking.EquipmentId,
          Quantity: 1,
          ReservationID: booking.ReservationID,
        }],
      });
      return { booking, order };
    },
    onSuccess: ({ booking, order }) => {
      setBooking(booking);
      success('Booking created!', `Order #${order.ID} added to My Orders`);
      qc.invalidateQueries({ queryKey: ['orders'] });
      navigate(`/orders/${order.ID}`);
    },
    onError: (err: Error) => setCheckError(err.message),
  });

  if (allEquipment.isLoading) return <LoadingCenter />;

  if (booking) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={32} color="var(--color-success)" />
            </div>
            <h2 style={{ marginBottom: 8 }}>Booking Confirmed!</h2>
            <p className="text-muted mb-4">An equipment unit has been reserved for you</p>

            <div className="detail-grid" style={{ textAlign: 'left', marginBottom: 20 }}>
              <div className="detail-item">
                <div className="detail-label">Booking ID</div>
                <div className="detail-value font-bold">#{booking.ReservationID}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value" style={{ color: 'var(--color-primary)' }}>{booking.Status}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Start</div>
                <div className="detail-value">{formatDateTime(booking.StartAt)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">End</div>
                <div className="detail-value">{formatDateTime(booking.EndAt)}</div>
              </div>
            </div>

            <div style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>ESTIMATED COST</div>
              <div className="price-large" style={{ color: 'var(--color-primary)' }}>{formatCurrency(booking.EstimatedCost)}</div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/orders/new', { state: { reservationId: booking.ReservationID, equipmentId: booking.EquipmentId } })}>
                Create Order
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const minStart = toLocalDatetimeInput(new Date());
  const endPreview = startAt && duration > 0
    ? new Date(new Date(startAt).getTime() + duration * (mode === 'hour' ? 3_600_000 : 86_400_000))
      .toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Equipment Rental</div>
          <div className="page-subtitle">Check availability and book</div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-header"><span className="card-title"><Calendar size={14} style={{ marginRight: 6 }} />Rental Parameters</span></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label required">Equipment</label>
              <select className="form-input form-select" value={equipmentId} onChange={e => { setEquipmentId(e.target.value); setAvailability(null); setCalcResult(null); }}>
                <option value="">Select equipment...</option>
                {rentalEquipment.map(eq => (
                  <option key={eq.ID} value={eq.ID}>{eq.Name} ({eq.Category})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">Rental Start</label>
              <input
                type="datetime-local"
                className={`form-input${startAt && new Date(startAt) <= new Date() ? ' error' : ''}`}
                min={minStart}
                value={startAt}
                onChange={e => {
                  const val = e.target.value;
                  setStartAt(val);
                  setAvailability(null);
                  setCalcResult(null);
                  if (val && new Date(val) <= new Date()) {
                    setCheckError('Start time cannot be in the past');
                  } else {
                    setCheckError('');
                  }
                }}
              />
              {startAt && new Date(startAt) <= new Date() && (
                <div className="form-error">Choose a future date and time</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label required">Duration</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number" className="form-input" min={1} max={365}
                  value={duration}
                  onChange={e => { setDuration(Math.max(1, Number(e.target.value))); setAvailability(null); setCalcResult(null); }}
                  style={{ flex: 1, fontWeight: 600 }}
                />
                <select
                  className="form-input form-select"
                  style={{ flex: 1.4 }}
                  value={mode}
                  onChange={e => { setMode(e.target.value as 'day' | 'hour'); setAvailability(null); setCalcResult(null); }}
                >
                  <option value="hour">{duration === 1 ? 'Hour' : 'Hours'}</option>
                  <option value="day">{duration === 1 ? 'Day' : 'Days'}</option>
                </select>
              </div>
            </div>

            {endPreview && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 'var(--radius)',
                background: 'var(--color-surface-2)', marginBottom: 12,
                fontSize: 13, color: 'var(--color-text-muted)',
              }}>
                <Calendar size={13} />
                <span>Returns: <strong style={{ color: 'var(--color-text)' }}>{endPreview}</strong></span>
              </div>
            )}

            <button className="btn btn-primary btn-full" onClick={handleCheck} disabled={checking || !equipmentId || !startAt || duration <= 0}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {checking ? <Spinner size="sm" white /> : <Calendar size={16} />}
              {checking ? 'Checking...' : 'Check Availability'}
            </button>
          </div>
        </div>

        <div>
          {checkError && <Alert type="error" className="mb-4">{checkError}</Alert>}

          {availability && (
            <div className="card mb-4">
              <div className="card-header"><span className="card-title">Availability Result</span></div>
              <div className="card-body">
                <Alert type={availability.Available ? 'success' : 'error'}>
                  {availability.Available
                    ? `✓ ${availability.AvailableUnits} unit(s) available`
                    : '✗ No available units for the selected dates'}
                </Alert>

                {calcResult && availability.Available && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 6 }}>ESTIMATED COST</div>
                      <div className="price-large" style={{ color: 'var(--color-primary)' }}>{formatCurrency(calcResult.Amount)}</div>
                      <div className="text-xs text-muted mt-1">{duration} {mode === 'day' ? (duration === 1 ? 'day' : 'days') : (duration === 1 ? 'hour' : 'hours')}</div>
                    </div>

                    <button
                      className="btn btn-success btn-full"
                      disabled={bookMutation.isPending}
                      onClick={() => bookMutation.mutate({
                        EquipmentID: Number(equipmentId),
                        StartAt: new Date(startAt).toISOString(),
                        EndAt: computeEndAt(),
                      })}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      {bookMutation.isPending ? <Spinner size="sm" white /> : null}
                      {bookMutation.isPending ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!availability && !checkError && (
            <div className="card" style={{ background: 'var(--color-surface-2)' }}>
              <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
                <Calendar size={32} style={{ color: 'var(--color-text-light)', marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Select equipment and duration,<br />then click "Check Availability"</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
