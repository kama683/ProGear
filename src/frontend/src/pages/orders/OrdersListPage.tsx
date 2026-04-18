import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye } from 'lucide-react';
import { listOrders } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { LoadingCenter } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../../utils/format';

export function OrdersListPage() {
  const { isCustomer } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  const filtered = statusFilter ? orders.filter(o => o.Status === statusFilter) : orders;
  const sorted = [...filtered].sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());

  if (isLoading) return <LoadingCenter />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Заказы</div>
          <div className="page-subtitle">Все ваши заказы и их статусы</div>
        </div>
        {isCustomer && (
          <button className="btn btn-primary" onClick={() => navigate('/orders/new')}>
            <Plus size={16} /> Новый заказ
          </button>
        )}
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Все статусы</option>
          <option value="reserved">Забронирован</option>
          <option value="checked_out">Выдан</option>
          <option value="returned">Возвращён</option>
          <option value="completed">Завершён</option>
          <option value="cancelled">Отменён</option>
        </select>
        <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>Заказов: {sorted.length}</span>
      </div>

      {error ? (
        <div className="alert alert-error">Ошибка: {(error as Error).message}</div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<FileText size={24} />}
          title="Заказов не найдено"
          description={statusFilter ? 'Нет заказов с этим статусом' : 'Здесь будут ваши заказы'}
          action={isCustomer ? (
            <button className="btn btn-primary" onClick={() => navigate('/orders/new')}>
              <Plus size={16} /> Создать заказ
            </button>
          ) : undefined}
        />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Заказ</th>
                <th>Тип</th>
                <th>Статус</th>
                <th>Сумма</th>
                <th>Позиций</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(order => (
                <tr key={order.ID} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${order.ID}`)}>
                  <td><span style={{ fontWeight: 700 }}>#{order.ID}</span></td>
                  <td>
                    <Badge color={order.OrderType === 'rental' ? 'badge-blue' : order.OrderType === 'sale' ? 'badge-green' : 'badge-purple'}>
                      {order.OrderType === 'rental' ? 'Аренда' : order.OrderType === 'sale' ? 'Продажа' : 'Смешанный'}
                    </Badge>
                  </td>
                  <td><Badge color={getOrderStatusColor(order.Status)}>{getOrderStatusLabel(order.Status)}</Badge></td>
                  <td><span className="font-bold">{formatCurrency(order.TotalAmount)}</span></td>
                  <td className="text-muted">{order.Items?.length ?? '—'}</td>
                  <td className="text-muted text-sm">{formatDateTime(order.CreatedAt)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={e => { e.stopPropagation(); navigate(`/orders/${order.ID}`); }}>
                      <Eye size={16} />
                    </button>
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
