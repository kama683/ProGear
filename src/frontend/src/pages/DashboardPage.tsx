import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, FileText, Users, Plus, ArrowRight } from 'lucide-react';
import { listEquipment } from '../api/equipment';
import { listOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { LoadingCenter } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../utils/format';

export function DashboardPage() {
  const { user, isAdmin, isCustomer, canManageEquipment } = useAuth();
  const navigate = useNavigate();

  const { data: equipment = [], isLoading: eqLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => listEquipment(),
  });

  const { data: orders = [], isLoading: ordLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  const rentalEq = equipment.filter(e => e.Type === 'rental' || e.Type === 'both');
  const saleEq = equipment.filter(e => e.Type === 'sale' || e.Type === 'both');
  const recentOrders = [...orders].sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()).slice(0, 5);
  const activeOrders = orders.filter(o => o.Status === 'reserved' || o.Status === 'checked_out');

  if (eqLoading || ordLoading) return <LoadingCenter />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Добро пожаловать, {user?.Name?.split(' ')[0]}!</div>
          <div className="page-subtitle">Обзор вашего аккаунта</div>
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

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">Всего оборудования</div>
          <div className="stat-card-value">{equipment.length}</div>
          <div className="stat-card-sub">{rentalEq.length} аренда · {saleEq.length} продажа</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Заказов</div>
          <div className="stat-card-value">{orders.length}</div>
          <div className="stat-card-sub">{activeOrders.length} активных</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Активные аренды</div>
          <div className="stat-card-value">{activeOrders.length}</div>
          <div className="stat-card-sub">в процессе</div>
        </div>
        {(isAdmin || !isCustomer) && (
          <div className="stat-card">
            <div className="stat-card-label">Доступных позиций</div>
            <div className="stat-card-value">{equipment.reduce((s, e) => s + e.Quantity, 0)}</div>
            <div className="stat-card-sub">единиц на складе</div>
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Последние заказы</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')}>
              Все заказы <ArrowRight size={14} />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="card-body">
              <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '16px 0' }}>Заказов ещё нет</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', border: 'none' }}>
              <table className="table">
                <thead><tr><th>Заказ</th><th>Сумма</th><th>Статус</th></tr></thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.ID} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${o.ID}`)}>
                      <td>
                        <div style={{ fontWeight: 600 }}>#{o.ID}</div>
                        <div className="text-sm text-muted">{formatDateTime(o.CreatedAt)}</div>
                      </td>
                      <td className="font-bold">{formatCurrency(o.TotalAmount)}</td>
                      <td><Badge color={getOrderStatusColor(o.Status)}>{getOrderStatusLabel(o.Status)}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Быстрые действия</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-secondary btn-full" onClick={() => navigate('/equipment')} style={{ justifyContent: 'flex-start', gap: 12 }}>
              <Package size={18} style={{ color: 'var(--color-primary)' }} />
              <div style={{ textAlign: 'left' }}>
                <div>Каталог оборудования</div>
                <div className="text-xs text-muted">Просмотр и фильтрация</div>
              </div>
            </button>
            {isCustomer && (
              <button className="btn btn-secondary btn-full" onClick={() => navigate('/rentals')} style={{ justifyContent: 'flex-start', gap: 12 }}>
                <ShoppingCart size={18} style={{ color: 'var(--color-primary)' }} />
                <div style={{ textAlign: 'left' }}>
                  <div>Арендовать оборудование</div>
                  <div className="text-xs text-muted">Проверить доступность и забронировать</div>
                </div>
              </button>
            )}
            <button className="btn btn-secondary btn-full" onClick={() => navigate('/orders')} style={{ justifyContent: 'flex-start', gap: 12 }}>
              <FileText size={18} style={{ color: 'var(--color-primary)' }} />
              <div style={{ textAlign: 'left' }}>
                <div>Мои заказы</div>
                <div className="text-xs text-muted">История и детали заказов</div>
              </div>
            </button>
            {isAdmin && (
              <button className="btn btn-secondary btn-full" onClick={() => navigate('/admin/users')} style={{ justifyContent: 'flex-start', gap: 12 }}>
                <Users size={18} style={{ color: 'var(--color-primary)' }} />
                <div style={{ textAlign: 'left' }}>
                  <div>Управление пользователями</div>
                  <div className="text-xs text-muted">Список всех пользователей</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
