import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, Calendar, Package, Hash } from 'lucide-react';
import { getEquipment } from '../../api/equipment';
import { checkAvailability, calculateRental } from '../../api/rentals';
import { useAuth } from '../../context/AuthContext';
import { LoadingCenter } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { formatCurrency, formatDateTime, getEquipmentTypeLabel, getEquipmentTypeColor, toLocalDatetimeInput } from '../../utils/format';
import type { AvailabilityResponse, CalculateResponse } from '../../types/api';

export function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageEquipment, isCustomer } = useAuth();

  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [mode, setMode] = useState<'day' | 'hour'>('day');
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [calcResult, setCalcResult] = useState<CalculateResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [calcError, setCalcError] = useState('');

  const { data: eq, isLoading } = useQuery({
    queryKey: ['equipment', Number(id)],
    queryFn: () => getEquipment(Number(id)),
    enabled: !!id,
  });

  async function handleCheck() {
    if (!startAt || !endAt || !id) return;
    setChecking(true); setCalcError(''); setAvailability(null); setCalcResult(null);
    try {
      const [avail, calc] = await Promise.all([
        checkAvailability(Number(id), new Date(startAt).toISOString(), new Date(endAt).toISOString()),
        calculateRental({ EquipmentId: Number(id), StartAt: new Date(startAt).toISOString(), EndAt: new Date(endAt).toISOString(), Mode: mode }),
      ]);
      setAvailability(avail); setCalcResult(calc);
    } catch (err: unknown) {
      setCalcError(err instanceof Error ? err.message : 'Ошибка проверки');
    } finally {
      setChecking(false);
    }
  }

  if (isLoading) return <LoadingCenter />;
  if (!eq) return <Alert type="error">Оборудование не найдено</Alert>;

  const minStart = toLocalDatetimeInput(new Date());

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/equipment')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="page-title">{eq.Name}</div>
            <div className="page-subtitle">{eq.Category}</div>
          </div>
        </div>
        {canManageEquipment && (
          <button className="btn btn-secondary" onClick={() => navigate(`/equipment/${id}/edit`)}>
            <Edit size={16} /> Редактировать
          </button>
        )}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Информация</span></div>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Тип</div>
                  <div className="detail-value"><Badge color={getEquipmentTypeColor(eq.Type)}>{getEquipmentTypeLabel(eq.Type)}</Badge></div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Категория</div>
                  <div className="detail-value">{eq.Category || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Кол-во единиц</div>
                  <div className="detail-value">{eq.Quantity}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Доступно сейчас</div>
                  <div className="detail-value">
                    <span style={{ color: eq.AvailableUnits > 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                      {eq.AvailableUnits}
                    </span>
                  </div>
                </div>
                {(eq.Type === 'rental' || eq.Type === 'both') && (
                  <div className="detail-item">
                    <div className="detail-label">Аренда/день</div>
                    <div className="detail-value price">{formatCurrency(eq.DailyRate)}</div>
                  </div>
                )}
                {(eq.Type === 'sale' || eq.Type === 'both') && (
                  <div className="detail-item">
                    <div className="detail-label">Цена продажи</div>
                    <div className="detail-value price">{formatCurrency(eq.SalePrice)}</div>
                  </div>
                )}
                <div className="detail-item">
                  <div className="detail-label">Добавлено</div>
                  <div className="detail-value">{formatDateTime(eq.CreatedAt)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Обновлено</div>
                  <div className="detail-value">{formatDateTime(eq.UpdatedAt)}</div>
                </div>
              </div>

              {eq.Description && (
                <div style={{ marginTop: 16 }}>
                  <div className="detail-label" style={{ marginBottom: 6 }}>Описание</div>
                  <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>{eq.Description}</p>
                </div>
              )}
            </div>
          </div>

          {eq.Serials && eq.Serials.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Hash size={14} style={{ marginRight: 6 }} />Серийные номера</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {eq.Serials.map(s => (
                  <span key={s} className="badge badge-gray" style={{ fontFamily: 'monospace', fontSize: 12 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {(eq.Type === 'rental' || eq.Type === 'both') && (
          <div className="card">
            <div className="card-header"><span className="card-title"><Calendar size={14} style={{ marginRight: 6 }} />Проверить доступность</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label required">Начало аренды</label>
                <input type="datetime-local" className="form-input" min={minStart}
                  value={startAt} onChange={e => setStartAt(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label required">Конец аренды</label>
                <input type="datetime-local" className="form-input" min={startAt || minStart}
                  value={endAt} onChange={e => setEndAt(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Режим расчёта</label>
                <select className="form-input form-select" value={mode} onChange={e => setMode(e.target.value as 'day' | 'hour')}>
                  <option value="day">По дням</option>
                  <option value="hour">По часам</option>
                </select>
              </div>
              <button className="btn btn-primary btn-full" onClick={handleCheck} disabled={checking || !startAt || !endAt}>
                {checking ? 'Проверяем...' : 'Проверить'}
              </button>

              {calcError && <Alert type="error" className="mt-4">{calcError}</Alert>}

              {availability && (
                <div className="mt-4">
                  <Alert type={availability.Available ? 'success' : 'error'}>
                    {availability.Available
                      ? `Доступно ${availability.AvailableUnits} единиц`
                      : 'Нет доступных единиц на эти даты'}
                  </Alert>
                  {calcResult && availability.Available && (
                    <div className="card mt-4" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)' }}>
                      <div className="card-body" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>РАСЧЁТНАЯ СТОИМОСТЬ</div>
                        <div className="price-large" style={{ color: 'var(--color-primary)' }}>{formatCurrency(calcResult.Amount)}</div>
                        <div className="text-xs text-muted mt-1">Режим: {mode === 'day' ? 'по дням' : 'по часам'}</div>
                      </div>
                    </div>
                  )}
                  {availability.Available && isCustomer && (
                    <button
                      className="btn btn-primary btn-full mt-4"
                      onClick={() => navigate('/rentals', { state: { equipmentId: Number(id), startAt, endAt, equipmentName: eq.Name } })}
                    >
                      <Package size={16} /> Перейти к бронированию
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
