import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Eye, Edit } from 'lucide-react';
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
          <div className="page-title">Оборудование</div>
          <div className="page-subtitle">Каталог оборудования для аренды и продажи</div>
        </div>
        {canManageEquipment && (
          <button className="btn btn-primary" onClick={() => navigate('/equipment/new')}>
            <Plus size={16} /> Добавить
          </button>
        )}
      </div>

      <div className="filters-bar">
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="form-input" style={{ paddingLeft: 32, padding: '6px 12px 6px 32px' }}
            placeholder="Поиск по названию, категории..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Все типы</option>
          <option value="rental">Аренда</option>
          <option value="sale">Продажа</option>
          <option value="both">Аренда + Продажа</option>
        </select>
      </div>

      {error ? (
        <div className="alert alert-error">Ошибка загрузки: {(error as Error).message}</div>
      ) : filtered.length === 0 ? (
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
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}></th>
                <th>Название</th>
                <th>Категория</th>
                <th>Тип</th>
                <th>Аренда/день</th>
                <th>Цена продажи</th>
                <th>Кол-во</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(eq => (
                <tr key={eq.ID}>
                  <td>
                    {eq.Images && eq.Images.length > 0 ? (
                      <img
                        src={eq.Images[0]}
                        alt={eq.Name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-border)', display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle, #f3f4f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                        <Package size={22} />
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{eq.Name}</div>
                    {eq.Description && <div className="text-xs text-muted" style={{ marginTop: 2 }}>{eq.Description.slice(0, 60)}{eq.Description.length > 60 ? '…' : ''}</div>}
                  </td>
                  <td><span className="text-sm">{eq.Category || '—'}</span></td>
                  <td><Badge color={getEquipmentTypeColor(eq.Type)}>{getEquipmentTypeLabel(eq.Type)}</Badge></td>
                  <td>
                    {(eq.Type === 'rental' || eq.Type === 'both') ? (
                      <span className="font-semibold">{formatCurrency(eq.DailyRate)}</span>
                    ) : '—'}
                  </td>
                  <td>
                    {(eq.Type === 'sale' || eq.Type === 'both') ? (
                      <span className="font-semibold">{formatCurrency(eq.SalePrice)}</span>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`font-semibold ${Number(eq.Quantity) === 0 ? 'text-muted' : ''}`}>
                      {eq.Quantity}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" title="Просмотр" onClick={() => navigate(`/equipment/${eq.ID}`)}>
                        <Eye size={16} />
                      </button>
                      {canManageEquipment && (
                        <button className="btn btn-ghost btn-sm btn-icon" title="Редактировать" onClick={() => navigate(`/equipment/${eq.ID}/edit`)}>
                          <Edit size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
