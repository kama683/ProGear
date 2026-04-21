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

  const filtered = equipment.filter(e =>
    !search ||
    e.Name.toLowerCase().includes(search.toLowerCase()) ||
    e.Category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingCenter />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Добро пожаловать, {user?.Name?.split(' ')[0]}!</div>
          <div className="page-subtitle">Каталог оборудования для аренды и продажи</div>
        </div>
        <div className="page-header-actions">
          {isCustomer && (
            <button className="btn btn-primary" onClick={() => navigate('/rentals')}>
              <Plus size={16} /> Арендовать
            </button>
          )}
          {canManageEquipment && (
            <button className="btn btn-primary" onClick={() => navigate('/equipment/new')}>
              <Plus size={16} /> Добавить товар
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
            placeholder="Поиск по названию, категории..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Все типы</option>
          <option value="rental">Аренда</option>
          <option value="sale">Продажа</option>
          <option value="both">Аренда + Продажа</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={24} />}
          title="Оборудование не найдено"
          description={search || typeFilter ? 'Попробуйте изменить фильтры' : 'Каталог пока пуст'}
          action={canManageEquipment ? (
            <button className="btn btn-primary" onClick={() => navigate('/equipment/new')}>
              <Plus size={16} /> Добавить оборудование
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
                <div>
                  {(eq.Type === 'rental' || eq.Type === 'both') && (
                    <div>
                      <span className="eq-card-price">{formatCurrency(eq.DailyRate)}</span>
                      <span className="eq-card-price-sub"> / день</span>
                    </div>
                  )}
                  {(eq.Type === 'sale' || eq.Type === 'both') && (
                    <div>
                      <span className="eq-card-price">{formatCurrency(eq.SalePrice)}</span>
                      <span className="eq-card-price-sub"> цена</span>
                    </div>
                  )}
                </div>
                <div className="eq-card-status">
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: eq.Quantity > 0 ? 'var(--color-success)' : 'var(--color-danger)', display: 'inline-block' }} />
                  {eq.Quantity > 0 ? `В наличии: ${eq.Quantity} шт.` : 'Нет в наличии'}
                </div>
              </div>
              <div className="eq-card-footer">
                <button
                  className="btn btn-primary btn-full btn-sm"
                  onClick={() => navigate(`/equipment/${eq.ID}`)}
                >
                  Подробнее
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
