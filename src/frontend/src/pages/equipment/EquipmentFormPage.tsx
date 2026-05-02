import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, MapPin } from 'lucide-react';
import { getEquipment, createEquipment, updateEquipment } from '../../api/equipment';
import { useToast } from '../../hooks/useToast';
import { LoadingCenter, Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import type { EquipmentType } from '../../types/api';

interface FormData {
  Name: string; Category: string; Description: string; Type: string;
  DailyRate: string; HourlyRate: string; SalePrice: string; Quantity: string;
  Address: string; Serials: string[]; Images: string[];
}

const empty: FormData = {
  Name: '', Category: '', Description: '', Type: 'rental',
  DailyRate: '', HourlyRate: '', SalePrice: '', Quantity: '1',
  Address: '', Serials: [], Images: [],
};

export function EquipmentFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState<FormData>(empty);
  const [serialInput, setSerialInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [submitError, setSubmitError] = useState('');

  const { data: existing, isLoading } = useQuery({
    queryKey: ['equipment', Number(id)],
    queryFn: () => getEquipment(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing && isEdit) {
      setForm({
        Name: existing.Name, Category: existing.Category, Description: existing.Description,
        Type: existing.Type, DailyRate: existing.DailyRate,
        HourlyRate: existing.HourlyRate ?? '',
        SalePrice: existing.SalePrice,
        Quantity: String(existing.Quantity), Address: existing.Address ?? '',
        Serials: existing.Serials ?? [], Images: existing.Images ?? [],
      });
    }
  }, [existing, isEdit]);

  const createMutation = useMutation({
    mutationFn: createEquipment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipment'] }); success('Equipment added!'); navigate('/equipment'); },
    onError: (err: Error) => { setSubmitError(err.message); toastError('Error', err.message); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data }: { data: Parameters<typeof updateEquipment>[1] }) => updateEquipment(Number(id), data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipment'] }); success('Equipment updated!'); navigate(`/equipment/${id}`); },
    onError: (err: Error) => { setSubmitError(err.message); toastError('Error', err.message); },
  });

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function addSerial() {
    const s = serialInput.trim();
    if (!s || form.Serials.includes(s)) return;
    setForm(prev => ({ ...prev, Serials: [...prev.Serials, s] }));
    setSerialInput('');
  }

  function removeSerial(s: string) {
    setForm(prev => ({ ...prev, Serials: prev.Serials.filter(x => x !== s) }));
  }

  function addImage() {
    const url = imageInput.trim();
    if (!url || form.Images.includes(url)) return;
    setForm(prev => ({ ...prev, Images: [...prev.Images, url] }));
    setImageInput('');
  }

  function removeImage(url: string) {
    setForm(prev => ({ ...prev, Images: prev.Images.filter(x => x !== url) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    if (!form.Name.trim()) { setSubmitError('Enter a name'); return; }
    if (!form.Category.trim()) { setSubmitError('Enter a category'); return; }

    const qty = parseInt(form.Quantity);
    if (isNaN(qty) || qty < 0) { setSubmitError('Invalid quantity'); return; }

    if (isEdit) {
      updateMutation.mutate({
        data: {
          Name: form.Name, Category: form.Category, Description: form.Description,
          Type: form.Type as EquipmentType,
          DailyRate: form.DailyRate ? parseFloat(form.DailyRate) : undefined,
          HourlyRate: form.HourlyRate ? parseFloat(form.HourlyRate) : undefined,
          SalePrice: form.SalePrice ? parseFloat(form.SalePrice) : undefined,
          Quantity: qty,
          Address: form.Address || undefined,
          Images: form.Images,
        },
      });
    } else {
      if (!form.DailyRate && (form.Type === 'rental' || form.Type === 'both')) { setSubmitError('Enter the rental rate'); return; }
      if (!form.SalePrice && (form.Type === 'sale' || form.Type === 'both')) { setSubmitError('Enter the sale price'); return; }
      createEquipment({
        Name: form.Name, Category: form.Category, Description: form.Description,
        Type: form.Type as 'rental' | 'sale' | 'both',
        DailyRate: parseFloat(form.DailyRate) || 0,
        HourlyRate: form.HourlyRate ? parseFloat(form.HourlyRate) : undefined,
        SalePrice: parseFloat(form.SalePrice) || 0,
        Quantity: qty,
        Address: form.Address || undefined,
        Serials: form.Serials.length > 0 ? form.Serials : undefined,
        Images: form.Images.length > 0 ? form.Images : undefined,
      }).then(() => { qc.invalidateQueries({ queryKey: ['equipment'] }); success('Equipment added!'); navigate('/equipment'); })
        .catch((err: Error) => { setSubmitError(err.message); });
    }
  }

  const busy = createMutation.isPending || updateMutation.isPending;
  const showRental = form.Type === 'rental' || form.Type === 'both';
  const showSale = form.Type === 'sale' || form.Type === 'both';

  if (isLoading) return <LoadingCenter />;

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(isEdit ? `/equipment/${id}` : '/equipment')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="page-title">{isEdit ? 'Edit Equipment' : 'Add Equipment'}</div>
            <div className="page-subtitle">{isEdit ? existing?.Name : 'New catalog item'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {submitError && <Alert type="error" className="mb-4">{submitError}</Alert>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Name</label>
                <input type="text" className="form-input" placeholder="e.g. Bosch Drill"
                  value={form.Name} onChange={e => update('Name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label required">Category</label>
                <input type="text" className="form-input" placeholder="Power Tools"
                  value={form.Category} onChange={e => update('Category', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" placeholder="Brief description of the equipment..."
                value={form.Description} onChange={e => update('Description', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Type</label>
                <select className="form-input form-select" value={form.Type} onChange={e => update('Type', e.target.value)}>
                  <option value="rental">Rental Only</option>
                  <option value="sale">Sale Only</option>
                  <option value="both">Rental & Sale</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">Quantity</label>
                <input type="number" className="form-input" min="0" placeholder="1"
                  value={form.Quantity} onChange={e => update('Quantity', e.target.value)} />
              </div>
            </div>

            {showRental && (
              <>
                <div className="form-group">
                  <label className="form-label required">Daily Rental Rate</label>
                  <input type="number" className="form-input" placeholder="5000" min="0" step="0.01"
                    value={form.DailyRate} onChange={e => update('DailyRate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Rental Rate</label>
                  <input type="number" className="form-input"
                    placeholder={form.DailyRate ? `Auto: ${(parseFloat(form.DailyRate) / 5).toFixed(0)} (daily ÷ 5)` : 'e.g. 1000'}
                    min="0" step="0.01"
                    value={form.HourlyRate} onChange={e => update('HourlyRate', e.target.value)} />
                  <div className="form-hint">
                    Optional. If left empty, hourly rate = daily rate ÷ 5
                    {form.DailyRate && !form.HourlyRate && (
                      <span style={{ color: 'var(--color-primary)', marginLeft: 4 }}>
                        = {(parseFloat(form.DailyRate) / 5).toFixed(0)} per hour
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {showSale && (
              <div className="form-group">
                <label className="form-label required">Sale Price</label>
                <input type="number" className="form-input" placeholder="50000" min="0" step="0.01"
                  value={form.SalePrice} onChange={e => update('SalePrice', e.target.value)} />
              </div>
            )}

            {/* Store address */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} />
                Store Address
              </label>
              <input
                type="text" className="form-input"
                placeholder="e.g. Tashkent, Mirzo Ulugbek, Amir Temur 108"
                value={form.Address} onChange={e => update('Address', e.target.value)}
              />
              <div className="form-hint">Customers will see a map with this address on the product page</div>
            </div>

            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Serial Numbers</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text" className="form-input" placeholder="SN-001"
                    value={serialInput} onChange={e => setSerialInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSerial(); } }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={addSerial}>
                    <Plus size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.Serials.map(s => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 20, fontSize: 12 }}>
                      {s}
                      <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} onClick={() => removeSerial(s)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="form-hint">Press Enter or click + to add</div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Product Photos</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="url" className="form-input" placeholder="https://example.com/photo.jpg"
                  value={imageInput} onChange={e => setImageInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                />
                <button type="button" className="btn btn-secondary" onClick={addImage}>
                  <Plus size={16} />
                </button>
              </div>
              {form.Images.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  {form.Images.map(url => (
                    <div key={url} style={{ position: 'relative', width: 80, height: 80 }}>
                      <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-border)' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        style={{ position: 'absolute', top: -6, right: -6, background: 'var(--color-danger, #ef4444)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="form-hint">Paste an image URL and press Enter or +</div>
            </div>
          </div>

          <div className="card-footer">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(isEdit ? `/equipment/${id}` : '/equipment')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy && <Spinner size="sm" white />}
              {busy ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
