import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Edit } from 'lucide-react';
import { listEquipment } from '../../api/equipment';
import { useAuth } from '../../context/AuthContext';
import { LoadingCenter } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, getEquipmentTypeLabel, getEquipmentTypeColor } from '../../utils/format';

export function EquipmentListPage() {
  const { canManageEquipment } = useAuth();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['equipment', typeFilter],
    queryFn: () => listEquipment(typeFilter ? { type: typeFilter } : undefined),
  });

  const filtered = equipment.filter(e =>
    !search || e.Name.toLowerCase().includes(search.toLowerCase()) ||
    e.Category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingCenter />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Equipment</div>
          <div className="page-subtitle">Equipment catalog for rental and sale</div>
        </div>
        {canManageEquipment && (
          <button className="btn btn-primary" onClick={() => navigate('/equipment/new')}>
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      <div className="filters-bar">
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="form-input" style={{ paddingLeft: 32, padding: '6px 12px 6px 32px' }}
            placeholder="Search by name, category..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="rental">Rental</option>
          <option value="sale">Sale</option>
          <option value="both">Rental + Sale</option>
        </select>
      </div>

      {error ? (
        <div className="alert alert-error">Load error: {(error as Error).message}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={24} />}
          title="No equipment found"
          description={search || typeFilter ? 'Try adjusting the filters' : 'The catalog is empty'}
          action={canManageEquipment ? (
            <button className="btn btn-primary" onClick={() => navigate('/equipment/new')}>
              <Plus size={16} /> Add Equipment
            </button>
          ) : undefined}
        />
      ) : (
        <div className="eq-grid">
          {filtered.map(eq => (
            <div key={eq.ID} className="eq-card">
              {eq.Images && eq.Images.length > 0 ? (
                <img src={eq.Images[0]} alt={eq.Name} className="eq-card-img" />
              ) : (
                <div className="eq-card-img-placeholder">
                  <Package size={48} />
                </div>
              )}
              <div className="eq-card-body">
                <div className="eq-card-meta">
                  <span className="eq-card-category">{eq.Category}</span>
                  <Badge color={getEquipmentTypeColor(eq.Type)}>
                    {getEquipmentTypeLabel(eq.Type)}
                  </Badge>
                </div>
                <div className="eq-card-name">{eq.Name}</div>
                {eq.Description && (
                  <div className="text-sm text-muted" style={{ lineHeight: 1.4 }}>
                    {eq.Description.slice(0, 80)}{eq.Description.length > 80 ? '…' : ''}
                  </div>
                )}
                <div>
                  {(eq.Type === 'rental' || eq.Type === 'both') && (
                    <div>
                      <span className="eq-card-price">{formatCurrency(eq.DailyRate)}</span>
                      <span className="eq-card-price-sub"> / day</span>
                    </div>
                  )}
                  {(eq.Type === 'sale' || eq.Type === 'both') && (
                    <div>
                      <span className="eq-card-price">{formatCurrency(eq.SalePrice)}</span>
                      <span className="eq-card-price-sub"> price</span>
                    </div>
                  )}
                </div>
                <div className="eq-card-status">
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: eq.Quantity > 0 ? 'var(--color-success)' : 'var(--color-danger)', display: 'inline-block' }} />
                  {eq.Quantity > 0 ? `In stock: ${eq.Quantity} units` : 'Out of stock'}
                </div>
              </div>
              <div className="eq-card-footer" style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => navigate(`/equipment/${eq.ID}`)}
                >
                  View Details
                </button>
                {canManageEquipment && (
                  <button
                    className="btn btn-secondary btn-sm btn-icon"
                    title="Edit"
                    onClick={() => navigate(`/equipment/${eq.ID}/edit`)}
                  >
                    <Edit size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
