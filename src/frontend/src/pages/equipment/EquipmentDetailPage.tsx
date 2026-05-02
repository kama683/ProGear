import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, Calendar, Package, Hash, Heart, ShoppingBag, CheckCircle, ImageOff, ChevronLeft, ChevronRight, MapPin, ExternalLink } from 'lucide-react';
import { getEquipment } from '../../api/equipment';
import { checkAvailability, calculateRental, bookRental } from '../../api/rentals';
import { createOrder } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../hooks/useToast';
import { LoadingCenter, Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { ReviewsList } from '../../components/equipment/ReviewsList';
import { formatCurrency, formatDateTime, getEquipmentTypeLabel, getEquipmentTypeColor, toLocalDatetimeInput } from '../../utils/format';
import type { AvailabilityResponse, CalculateResponse, BookingResponse } from '../../types/api';

export function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageEquipment, isCustomer } = useAuth();
  const { addItem, isInCart } = useCart();
  const { toggle, isSaved } = useWishlist();
  const { success } = useToast();
  const qc = useQueryClient();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [startAt, setStartAt] = useState('');
  const [duration, setDuration] = useState(1);
  const [mode, setMode] = useState<'day' | 'hour'>('day');
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [calcResult, setCalcResult] = useState<CalculateResponse | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [calcError, setCalcError] = useState('');

  function computeEndAt(start: string): string {
    if (!start || duration <= 0) return '';
    const ms = duration * (mode === 'hour' ? 3_600_000 : 86_400_000);
    return new Date(new Date(start).getTime() + ms).toISOString();
  }

  const { data: eq, isLoading } = useQuery({
    queryKey: ['equipment', Number(id)],
    queryFn: () => getEquipment(Number(id)),
    enabled: !!id,
  });

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
      setOrderId(order.ID);
      success('Booking confirmed!', `Order #${order.ID} created`);
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: Error) => setCalcError(err.message),
  });

  async function handleCheck() {
    if (!startAt || duration <= 0 || !id) return;
    if (new Date(startAt) <= new Date()) {
      setCalcError('Rental start time cannot be in the past');
      return;
    }
    const endAtISO = computeEndAt(startAt);
    if (!endAtISO) return;
    setChecking(true); setCalcError(''); setAvailability(null); setCalcResult(null);
    try {
      const startISO = new Date(startAt).toISOString();
      const [avail, calc] = await Promise.all([
        checkAvailability(Number(id), startISO, endAtISO),
        calculateRental({ EquipmentId: Number(id), StartAt: startISO, EndAt: endAtISO, Mode: mode }),
      ]);
      setAvailability(avail); setCalcResult(calc);
    } catch (err: unknown) {
      setCalcError(err instanceof Error ? err.message : 'Check failed');
    } finally {
      setChecking(false);
    }
  }

  function resetBooking() {
    setBooking(null);
    setAvailability(null);
    setCalcResult(null);
    setStartAt('');
    setDuration(1);
    setCalcError('');
    setOrderId(null);
  }

  if (isLoading) return <LoadingCenter />;
  if (!eq) return <Alert type="error">Equipment not found</Alert>;

  const minStart = toLocalDatetimeInput(new Date());
  const saved = isSaved(eq.ID);
  const cartType = eq.Type === 'sale' ? 'sale' : 'rental';
  const inCart = isInCart(eq.ID, cartType);
  const images: string[] = eq.Images ?? [];
  const hasImages = images.length > 0;
  const activeImg = hasImages ? images[activeImgIndex] : null;

  function prevImg() { setActiveImgIndex(i => (i - 1 + images.length) % images.length); }
  function nextImg() { setActiveImgIndex(i => (i + 1) % images.length); }

  return (
    <div>
      {/* Page header */}
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary btn-icon"
            title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            onClick={() => toggle(eq.ID)}
          >
            <Heart size={16} style={{ fill: saved ? '#ef4444' : 'transparent', color: saved ? '#ef4444' : undefined }} />
          </button>
          <button
            className="btn btn-secondary"
            disabled={inCart || eq.Quantity === 0}
            title={inCart ? 'Already in cart' : 'Add to cart'}
            onClick={() => addItem({
              equipmentId: eq.ID, equipmentName: eq.Name, category: eq.Category,
              itemType: cartType, quantity: 1,
              dailyRate: eq.DailyRate, salePrice: eq.SalePrice,
            })}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ShoppingBag size={15} style={{ color: inCart ? 'var(--color-primary)' : undefined }} />
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
          {canManageEquipment && (
            <button className="btn btn-secondary" onClick={() => navigate(`/equipment/${id}/edit`)}>
              <Edit size={16} /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Photo gallery */}
          <div className="card mb-4" style={{ overflow: 'hidden' }}>
            {hasImages ? (
              <>
                <div style={{ position: 'relative', height: 340, background: '#000' }}>
                  <img
                    src={activeImg!}
                    alt={eq.Name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImg}
                        style={{
                          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
                          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff',
                        }}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImg}
                        style={{
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
                          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff',
                        }}
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImgIndex(i)}
                            style={{
                              width: i === activeImgIndex ? 20 : 8, height: 8,
                              borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
                              background: i === activeImgIndex ? 'var(--color-primary)' : 'rgba(255,255,255,0.55)',
                              transition: 'width 0.2s',
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="card-body" style={{ paddingTop: 10, paddingBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImgIndex(i)}
                          style={{
                            flexShrink: 0, width: 68, height: 68,
                            borderRadius: 'var(--radius)', overflow: 'hidden', padding: 0,
                            cursor: 'pointer', border: `2px solid ${i === activeImgIndex ? 'var(--color-primary)' : 'transparent'}`,
                            opacity: i === activeImgIndex ? 1 : 0.65, transition: 'opacity 0.15s, border-color 0.15s',
                          }}
                        >
                          <img src={img} alt={`${eq.Name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                height: 260, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-surface-2)', color: 'var(--color-text-muted)',
              }}>
                <ImageOff size={52} style={{ marginBottom: 14, opacity: 0.3 }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No photos available</div>
                <div style={{ fontSize: 12 }}>The owner hasn't uploaded any photos yet</div>
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Information</span></div>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Type</div>
                  <div className="detail-value"><Badge color={getEquipmentTypeColor(eq.Type)}>{getEquipmentTypeLabel(eq.Type)}</Badge></div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Category</div>
                  <div className="detail-value">{eq.Category || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Total Units</div>
                  <div className="detail-value">{eq.Quantity}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Available Now</div>
                  <div className="detail-value">
                    <span style={{ color: eq.AvailableUnits > 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                      {eq.AvailableUnits}
                    </span>
                  </div>
                </div>
                {(eq.Type === 'rental' || eq.Type === 'both') && (
                  <>
                    <div className="detail-item">
                      <div className="detail-label">Rental / day</div>
                      <div className="detail-value price">{formatCurrency(eq.DailyRate)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Rental / hour</div>
                      <div className="detail-value price">{formatCurrency(eq.HourlyRate)}</div>
                    </div>
                  </>
                )}
                {(eq.Type === 'sale' || eq.Type === 'both') && (
                  <div className="detail-item">
                    <div className="detail-label">Sale Price</div>
                    <div className="detail-value price">{formatCurrency(eq.SalePrice)}</div>
                  </div>
                )}
                <div className="detail-item">
                  <div className="detail-label">Added</div>
                  <div className="detail-value">{formatDateTime(eq.CreatedAt)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Updated</div>
                  <div className="detail-value">{formatDateTime(eq.UpdatedAt)}</div>
                </div>
              </div>
              {eq.Description && (
                <div style={{ marginTop: 16 }}>
                  <div className="detail-label" style={{ marginBottom: 6 }}>Description</div>
                  <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>{eq.Description}</p>
                </div>
              )}
            </div>
          </div>

          {eq.Serials && eq.Serials.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <span className="card-title"><Hash size={14} style={{ marginRight: 6 }} />Serial Numbers</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {eq.Serials.map(s => (
                  <span key={s} className="badge badge-gray" style={{ fontFamily: 'monospace', fontSize: 12 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Store location map */}
          {eq.Address && (
            <div className="card mb-4">
              <div className="card-header">
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} />
                  Pickup Location
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eq.Address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                >
                  <ExternalLink size={13} />
                  Open in Maps
                </a>
              </div>
              <div style={{ overflow: 'hidden', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
                <iframe
                  title="Store location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(eq.Address)}&output=embed&z=15`}
                  width="100%"
                  height="220"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '12px 16px', borderTop: '1px solid var(--color-border)',
                }}>
                  <MapPin size={15} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5 }}>{eq.Address}</span>
                </div>
              </div>
            </div>
          )}

          <ReviewsList equipmentId={eq.ID} />
        </div>

        {/* Right column — Booking */}
        {(eq.Type === 'rental' || eq.Type === 'both') && (
          <div className="card" style={{ position: 'sticky', top: 20 }}>
            {booking ? (
              /* Booking confirmed screen */
              <div className="card-body" style={{ textAlign: 'center', padding: '40px 32px' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--color-success-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <CheckCircle size={32} color="var(--color-success)" />
                </div>
                <h3 style={{ marginBottom: 6 }}>Booking Confirmed!</h3>
                <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
                  Reservation and order created successfully
                </p>

                <div className="detail-grid" style={{ textAlign: 'left', marginBottom: 16 }}>
                  <div className="detail-item">
                    <div className="detail-label">Booking ID</div>
                    <div className="detail-value" style={{ fontWeight: 700 }}>#{booking.ReservationID}</div>
                  </div>
                  {orderId && (
                    <div className="detail-item">
                      <div className="detail-label">Order</div>
                      <div className="detail-value" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>#{orderId}</div>
                    </div>
                  )}
                  <div className="detail-item">
                    <div className="detail-label">Start</div>
                    <div className="detail-value">{formatDateTime(booking.StartAt)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">End</div>
                    <div className="detail-value">{formatDateTime(booking.EndAt)}</div>
                  </div>
                </div>

                <div style={{
                  background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)',
                  borderRadius: 'var(--radius-lg)', padding: '14px 20px', marginBottom: 20,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.05em' }}>TOTAL COST</div>
                  <div className="price-large" style={{ color: 'var(--color-primary)' }}>{formatCurrency(booking.EstimatedCost)}</div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                  {orderId && (
                    <button className="btn btn-primary btn-full" onClick={() => navigate(`/orders/${orderId}`)}>
                      View Order #{orderId}
                    </button>
                  )}
                  <button className="btn btn-secondary btn-full" onClick={() => navigate('/orders')}>
                    My Orders
                  </button>
                  <button className="btn btn-ghost btn-full" onClick={resetBooking} style={{ fontSize: 13 }}>
                    Book again
                  </button>
                </div>
              </div>
            ) : (
              /* Booking form */
              <>
                <div className="card-header">
                  <span className="card-title"><Calendar size={14} style={{ marginRight: 6 }} />Book This Equipment</span>
                </div>
                <div className="card-body">
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
                          setCalcError('Start time cannot be in the past');
                        } else {
                          setCalcError('');
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

                  {startAt && duration > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 'var(--radius)',
                      background: 'var(--color-surface-2)', marginBottom: 4,
                      fontSize: 13, color: 'var(--color-text-muted)',
                    }}>
                      <Calendar size={13} />
                      <span>Returns: <strong style={{ color: 'var(--color-text)' }}>
                        {new Date(new Date(startAt).getTime() + duration * (mode === 'hour' ? 3_600_000 : 86_400_000))
                          .toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </strong></span>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-full"
                    onClick={handleCheck}
                    disabled={checking || !startAt || duration <= 0}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    {checking ? <Spinner size="sm" white /> : <Calendar size={15} />}
                    {checking ? 'Checking…' : 'Check Availability'}
                  </button>

                  {calcError && <Alert type="error" className="mt-4">{calcError}</Alert>}

                  {availability && (
                    <div className="mt-4">
                      <Alert type={availability.Available ? 'success' : 'error'}>
                        {availability.Available
                          ? `${availability.AvailableUnits} unit(s) available for the selected dates`
                          : 'No available units for these dates'}
                      </Alert>

                      {calcResult && availability.Available && (
                        <div style={{
                          background: 'var(--color-primary-light)',
                          border: '1px solid var(--color-primary-border)',
                          borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                          textAlign: 'center', marginTop: 12, marginBottom: 12,
                        }}>
                          <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.05em' }}>ESTIMATED COST</div>
                          <div className="price-large" style={{ color: 'var(--color-primary)' }}>{formatCurrency(calcResult.Amount)}</div>
                          <div className="text-xs text-muted mt-1">{mode === 'day' ? 'Calculated by days' : 'Calculated by hours'}</div>
                        </div>
                      )}

                      {availability.Available && isCustomer && (
                        <button
                          className="btn btn-success btn-full"
                          disabled={bookMutation.isPending}
                          onClick={() => bookMutation.mutate({
                            EquipmentID: Number(id),
                            StartAt: new Date(startAt).toISOString(),
                            EndAt: computeEndAt(startAt),
                          })}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                          {bookMutation.isPending ? <Spinner size="sm" white /> : <Package size={15} />}
                          {bookMutation.isPending ? 'Booking…' : 'Book Now'}
                        </button>
                      )}
                    </div>
                  )}

                  {!availability && !checking && !calcError && (
                    <div style={{
                      marginTop: 16, padding: '16px', borderRadius: 'var(--radius)',
                      background: 'var(--color-surface-2)', textAlign: 'center',
                      fontSize: 13, color: 'var(--color-text-muted)',
                    }}>
                      Pick your dates and check availability
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
