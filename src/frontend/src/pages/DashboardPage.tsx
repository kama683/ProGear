import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search } from 'lucide-react';
import { listEquipment } from '../api/equipment';
import { useAuth } from '../context/AuthContext';
import { LoadingCenter } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, getEquipmentTypeLabel, getEquipmentTypeColor } from '../utils/format';

export function DashboardPage() {
  const { user, isCustomer, canManageEquipment } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment', typeFilter],
    queryFn: () => listEquipment(typeFilter ? { type: typeFilter } : undefined),
  });

  // filter by search text
  const filtered = equipment.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.Name.toLowerCase().includes(searchLower) ||
      item.Category.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) return <LoadingCenter />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Welcome, {user?.Name?.split(' ')[0]}!</div>
          <div className="page-subtitle">Equipment catalog for rental and sale</div>
        </div>
        <div className="page-header-actions">
          {isCustomer && (
            <button className="btn btn-primary" onClick={() => navigate('/rentals')}>
              <Plus size={16} /> Rent Now
            </button>
          )}
          {canManageEquipment && (
            <button className="btn btn-primary" onClick={() => navigate('/equipment/new')}>
              <Plus size={16} /> Add Item
            </button>
          )}
        </div>
      </div>

      <div className="filters-bar">
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32, padding: '6px 12px 6px 32px' }}
            placeholder="Search by name, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="rental">Rental</option>
          <option value="sale">Sale</option>
          <option value="both">Rental + Sale</option>
        </select>
      </div>

      {filtered.length === 0 ? (
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
          {filtered.map(item => (
            <div key={item.ID} className="eq-card">
              {item.Images && item.Images.length > 0 ? (
                <img src={item.Images[0]} alt={item.Name} className="eq-card-img" />
              ) : (
                <div className="eq-card-img-placeholder">
                  <Package size={48} />
                </div>
              )}
              <div className="eq-card-body">
                <div className="eq-card-meta">
                  <span className="eq-card-category">{item.Category}</span>
                  <Badge color={getEquipmentTypeColor(item.Type)}>
                    {getEquipmentTypeLabel(item.Type)}
                  </Badge>
                </div>
                <div className="eq-card-name">{item.Name}</div>
                <div>
                  {(item.Type === 'rental' || item.Type === 'both') && (
                    <div>
                      <span className="eq-card-price">{formatCurrency(item.DailyRate)}</span>
                      <span className="eq-card-price-sub"> / day</span>
                    </div>
                  )}
                  {(item.Type === 'sale' || item.Type === 'both') && (
                    <div>
                      <span className="eq-card-price">{formatCurrency(item.SalePrice)}</span>
                      <span className="eq-card-price-sub"> price</span>
                    </div>
                  )}
                </div>
                <div className="eq-card-status">
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: item.Quantity > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                    display: 'inline-block',
                  }} />
                  {item.Quantity > 0 ? `In stock: ${item.Quantity} units` : 'Out of stock'}
                </div>
              </div>
              <div className="eq-card-footer">
                <button
                  className="btn btn-primary btn-full btn-sm"
                  onClick={() => navigate(`/equipment/${item.ID}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
