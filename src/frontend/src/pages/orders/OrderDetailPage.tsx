import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText } from 'lucide-react';
import { listOrders, updateOrderStatus, getInvoice } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { LoadingCenter, Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../../utils/format';
import type { OrderStatus, Invoice } from '../../types/api';

const STATUS_FLOW: OrderStatus[] = ['reserved', 'checked_out', 'returned', 'completed'];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  reserved: ['checked_out', 'cancelled'],
  checked_out: ['returned'],
  returned: ['completed'],
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageOrders } = useAuth();
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();

  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<OrderStatus | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  const order = orders.find(o => o.ID === Number(id));

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(Number(id), { Status: status }),
    onSuccess: (updated) => {
      qc.setQueryData(['orders'], (prev: typeof orders) => prev.map(o => o.ID === updated.ID ? updated : o));
      success('Status updated', `Order #${id} → ${getOrderStatusLabel(updated.Status)}`);
      setConfirmStatus(null);
    },
    onError: (err: Error) => { toastError('Error', err.message); setConfirmStatus(null); },
  });

  async function handleGetInvoice() {
    setLoadingInvoice(true);
    try {
      const inv = await getInvoice(Number(id));
      setInvoiceData(inv); setInvoiceOpen(true);
    } catch (err: unknown) {
      toastError('Error', err instanceof Error ? err.message : 'Failed to get invoice');
    } finally {
      setLoadingInvoice(false);
    }
  }

  if (isLoading) return <LoadingCenter />;
  if (!order) return <Alert type="error">Order not found</Alert>;

  const nextStatuses = NEXT_STATUS[order.Status] ?? [];
  const isCancelled = order.Status === 'cancelled';
  const isCompleted = order.Status === 'completed' || isCancelled;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/orders')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="page-title">Order #{order.ID}</div>
            <div className="page-subtitle">{formatDateTime(order.CreatedAt)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleGetInvoice} disabled={loadingInvoice}>
            {loadingInvoice ? <Spinner size="sm" /> : <FileText size={16} />}
            Invoice
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="card mb-4">
            <div className="card-header">
              <span className="card-title">Order Information</span>
              <Badge color={getOrderStatusColor(order.Status)}>{getOrderStatusLabel(order.Status)}</Badge>
            </div>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Order Type</div>
                  <div className="detail-value">
                    <Badge color={order.OrderType === 'rental' ? 'badge-blue' : order.OrderType === 'sale' ? 'badge-green' : 'badge-purple'}>
                      {order.OrderType === 'rental' ? 'Rental' : order.OrderType === 'sale' ? 'Sale' : 'Mixed'}
                    </Badge>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Amount</div>
                  <div className="detail-value price" style={{ fontSize: 18 }}>{formatCurrency(order.TotalAmount)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Created</div>
                  <div className="detail-value">{formatDateTime(order.CreatedAt)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Items</div>
                  <div className="detail-value">{order.Items?.length ?? 0}</div>
                </div>
              </div>
            </div>
          </div>

          {order.Items && order.Items.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">Order Items</span></div>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead><tr><th>Type</th><th>Equipment</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {order.Items.map(item => (
                      <tr key={item.ID}>
                        <td>
                          <Badge color={item.ItemType === 'rental' ? 'badge-blue' : 'badge-green'}>
                            {item.ItemType === 'rental' ? 'Rental' : 'Sale'}
                          </Badge>
                        </td>
                        <td>
                          <div>ID: {item.EquipmentID}</div>
                          {item.StartAt && <div className="text-xs text-muted">{formatDateTime(item.StartAt)} — {formatDateTime(item.EndAt)}</div>}
                        </td>
                        <td>{item.Quantity}</td>
                        <td>{formatCurrency(item.UnitPrice)}</td>
                        <td className="font-bold">{formatCurrency(item.LineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card-footer" style={{ justifyContent: 'space-between' }}>
                <span className="text-muted">Total</span>
                <span className="font-bold" style={{ fontSize: 16 }}>{formatCurrency(order.TotalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Order Status</span></div>
            <div className="card-body">
              <div className="order-status-flow">
                {STATUS_FLOW.map((s, i) => {
                  const idx = STATUS_FLOW.indexOf(order.Status as OrderStatus);
                  const done = i < idx;
                  const active = s === order.Status;
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                      <div className={`order-status-step ${done ? 'done' : active ? 'active' : ''}`}>
                        <div className="order-status-dot" />
                        {getOrderStatusLabel(s)}
                      </div>
                      {i < STATUS_FLOW.length - 1 && <div className="order-status-arrow" style={{ margin: '0 8px', color: 'var(--color-border-strong)' }}>→</div>}
                    </div>
                  );
                })}
                {isCancelled && (
                  <div className="order-status-step cancelled">
                    <div className="order-status-dot" />
                    Cancelled
                  </div>
                )}
              </div>
            </div>
          </div>

          {canManageOrders && !isCompleted && nextStatuses.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">Update Status</span></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {nextStatuses.map(status => (
                  <button
                    key={status}
                    className={`btn btn-full ${status === 'cancelled' ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => setConfirmStatus(status)}
                  >
                    Move to "{getOrderStatusLabel(status)}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={!!confirmStatus}
        onClose={() => setConfirmStatus(null)}
        title="Confirm Action"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setConfirmStatus(null)}>Cancel</button>
            <button
              className={`btn ${confirmStatus === 'cancelled' ? 'btn-danger' : 'btn-primary'}`}
              disabled={statusMutation.isPending}
              onClick={() => confirmStatus && statusMutation.mutate(confirmStatus)}
            >
              {statusMutation.isPending ? <Spinner size="sm" white /> : null}
              Confirm
            </button>
          </>
        }
      >
        <p>Are you sure you want to change the status of order <strong>#{id}</strong> to <strong>"{confirmStatus ? getOrderStatusLabel(confirmStatus) : ''}"</strong>?</p>
        {confirmStatus === 'cancelled' && <Alert type="warning" className="mt-4">This action is irreversible.</Alert>}
      </Modal>

      <Modal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} title="Invoice" size="md">
        {invoiceData && (
          <div className="invoice-box">
            <div className="invoice-header">
              <div>
                <div className="invoice-number">Invoice</div>
                <div className="invoice-number"><strong>{invoiceData.InvoiceNumber}</strong></div>
                <div className="text-sm text-muted mt-1">Issued: {formatDateTime(invoiceData.IssuedAt)}</div>
              </div>
              <div className="invoice-total">
                <div className="invoice-total-label">Amount Due</div>
                <div className="invoice-total-amount">{formatCurrency(invoiceData.Amount)}</div>
                <div className="mt-1">
                  <Badge color={invoiceData.InvoiceStatus === 'paid' ? 'badge-green' : 'badge-yellow'}>
                    {invoiceData.InvoiceStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="divider" />
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Order</div>
                <div className="detail-value font-bold">#{invoiceData.OrderID}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value">{invoiceData.InvoiceStatus === 'paid' ? 'Paid' : 'Awaiting Payment'}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
