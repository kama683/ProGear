import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calculator, Calendar, CheckCircle } from 'lucide-react';
import { listEquipment } from '../../api/equipment';
import { checkAvailability, calculateRental, bookRental } from '../../api/rentals';
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

  const state = location.state as { equipmentId?: number; startAt?: string; endAt?: string; equipmentName?: string } | null;

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);

  const [equipmentId, setEquipmentId] = useState<string>(state?.equipmentId ? String(state.equipmentId) : '');
  const [startAt, setStartAt] = useState(state?.startAt ?? toLocalDatetimeInput(now));
  const [endAt, setEndAt] = useState(state?.endAt ?? toLocalDatetimeInput(tomorrow));
  const [mode, setMode] = useState<'day' | 'hour'>('day');
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [calcResult, setCalcResult] = useState<CalculateResponse | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');

  const { data: equipment = [], isLoading: eqLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => listEquipment({ type: 'rental' }),
  });

  const allEquipment = useQuery({ queryKey: ['equipment-all'], queryFn: () => listEquipment() });
  const rentalEquipment = allEquipment.data?.filter(e => e.Type === 'rental' || e.Type === 'both') ?? equipment;

  async function handleCheck() {
    if (!equipmentId || !startAt || !endAt) return;
    setChecking(true); setCheckError(''); setAvailability(null); setCalcResult(null);
    try {
      const [avail, calc] = await Promise.all([
        checkAvailability(Number(equipmentId), new Date(startAt).toISOString(), new Date(endAt).toISOString()),
        calculateRental({ EquipmentId: Number(equipmentId), StartAt: new Date(startAt).toISOString(), EndAt: new Date(endAt).toISOString(), Mode: mode }),
      ]);
      setAvailability(avail); setCalcResult(calc);
    } catch (err: unknown) {
      setCheckError(err instanceof Error ? err.message : 'Ошибка проверки');
    } finally {
      setChecking(false);
    }
  }

  const bookMutation = useMutation({
    mutationFn: bookRental,
    onSuccess: (res) => {
      setBooking(res);
      success('Бронирование создано!', `ID брони: ${res.ReservationID}`);
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: Error) => setCheckError(err.message),
  });

  if (eqLoading || allEquipment.isLoading) return <LoadingCenter />;

  if (booking) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={32} color="var(--color-success)" />
            </div>
            <h2 style={{ marginBottom: 8 }}>Бронирование подтверждено!</h2>
            <p className="text-muted mb-4">Единица оборудования зарезервирована для вас</p>

            <div className="detail-grid" style={{ textAlign: 'left', marginBottom: 20 }}>
              <div className="detail-item">
                <div className="detail-label">ID брони</div>
                <div className="detail-value font-bold">#{booking.ReservationID}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Статус</div>
                <div className="detail-value" style={{ color: 'var(--color-primary)' }}>{booking.Status}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Начало</div>
                <div className="detail-value">{formatDateTime(booking.StartAt)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Конец</div>
                <div className="detail-value">{formatDateTime(booking.EndAt)}</div>
              </div>
            </div>

            <div style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>РАСЧЁТНАЯ СТОИМОСТЬ</div>
              <div className="price-large" style={{ color: 'var(--color-primary)' }}>{formatCurrency(booking.EstimatedCost)}</div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/orders/new', { state: { reservationId: booking.ReservationID, equipmentId: booking.EquipmentId } })}>
                Оформить заказ
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                Мои заказы
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const minStart = toLocalDatetimeInput(new Date());

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Аренда оборудования</div>
          <div className="page-subtitle">Проверьте доступность и забронируйте</div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-header"><span className="card-title"><Calendar size={14} style={{ marginRight: 6 }} />Параметры аренды</span></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label required">Оборудование</label>
              <select className="form-input form-select" value={equipmentId} onChange={e => { setEquipmentId(e.target.value); setAvailability(null); setCalcResult(null); }}>
                <option value="">Выберите оборудование...</option>
                {rentalEquipment.map(eq => (
                  <option key={eq.ID} value={eq.ID}>{eq.Name} ({eq.Category})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">Начало аренды</label>
              <input type="datetime-local" className="form-input" min={minStart}
                value={startAt} onChange={e => { setStartAt(e.target.value); setAvailability(null); }} />
            </div>
            <div className="form-group">
              <label className="form-label required">Конец аренды</label>
              <input type="datetime-local" className="form-input" min={startAt || minStart}
                value={endAt} onChange={e => { setEndAt(e.target.value); setAvailability(null); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Режим расчёта</label>
              <select className="form-input form-select" value={mode} onChange={e => setMode(e.target.value as 'day' | 'hour')}>
                <option value="day">По дням</option>
                <option value="hour">По часам</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleCheck} disabled={checking || !equipmentId || !startAt || !endAt}>
              {checking ? <Spinner size="sm" white /> : <Calculator size={16} />}
              {checking ? 'Проверяем...' : 'Проверить доступность'}
            </button>
          </div>
        </div>

        <div>
          {checkError && <Alert type="error" className="mb-4">{checkError}</Alert>}

          {availability && (
            <div className="card mb-4">
              <div className="card-header"><span className="card-title">Результат проверки</span></div>
              <div className="card-body">
                <Alert type={availability.Available ? 'success' : 'error'}>
                  {availability.Available
                    ? `✓ Доступно ${availability.AvailableUnits} единиц(а) на выбранные даты`
                    : '✗ На выбранные даты нет свободных единиц'}
                </Alert>

                {calcResult && availability.Available && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 6 }}>РАСЧЁТНАЯ СТОИМОСТЬ</div>
                      <div className="price-large" style={{ color: 'var(--color-primary)' }}>{formatCurrency(calcResult.Amount)}</div>
                      <div className="text-xs text-muted mt-1">Режим: {mode === 'day' ? 'по дням' : 'по часам'}</div>
                    </div>

                    <button
                      className="btn btn-success btn-full"
                      disabled={bookMutation.isPending}
                      onClick={() => bookMutation.mutate({ EquipmentID: Number(equipmentId), StartAt: new Date(startAt).toISOString(), EndAt: new Date(endAt).toISOString() })}
                    >
                      {bookMutation.isPending ? <Spinner size="sm" white /> : null}
                      {bookMutation.isPending ? 'Бронирование...' : 'Забронировать'}
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
                <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Выберите оборудование и даты,<br />затем нажмите «Проверить доступность»</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
