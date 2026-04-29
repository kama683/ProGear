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

  // filter by status if selected
  const filtered = statusFilter
    ? orders.filter(order => order.Status === statusFilter)
    : orders;

  // newest first
  const sorted = [...filtered].sort((a, b) =>
    new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
  );

  if (isLoading) return <LoadingCenter />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-subtitle">All your orders and their statuses</div>
        </div>
        {isCustomer && (
          <button className="btn btn-primary" onClick={() => navigate('/orders/new')}>
            <Plus size={16} /> New Order
          </button>
        )}
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="reserved">Reserved</option>
          <option value="checked_out">Checked Out</option>
          <option value="returned">Returned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>
          Orders: {sorted.length}
        </span>
      </div>

      {error ? (
        <div className="alert alert-error">Error: {(error as Error).message}</div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<FileText size={24} />}
          title="No orders found"
          description={statusFilter ? 'No orders with this status' : 'Your orders will appear here'}
          action={isCustomer ? (
            <button className="btn btn-primary" onClick={() => navigate('/orders/new')}>
              <Plus size={16} /> Create Order
            </button>
          ) : undefined}
        />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Items</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(order => (
                <tr
                  key={order.ID}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/orders/${order.ID}`)}
                >
                  <td><span style={{ fontWeight: 700 }}>#{order.ID}</span></td>
                  <td>
                    <Badge color={
                      order.OrderType === 'rental' ? 'badge-blue' :
                      order.OrderType === 'sale' ? 'badge-green' : 'badge-purple'
                    }>
                      {order.OrderType === 'rental' ? 'Rental' : order.OrderType === 'sale' ? 'Sale' : 'Mixed'}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={getOrderStatusColor(order.Status)}>
                      {getOrderStatusLabel(order.Status)}
                    </Badge>
                  </td>
                  <td><span className="font-bold">{formatCurrency(order.TotalAmount)}</span></td>
                  <td className="text-muted">{order.Items?.length ?? '—'}</td>
                  <td className="text-muted text-sm">{formatDateTime(order.CreatedAt)}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/orders/${order.ID}`);
                      }}
                    >
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
