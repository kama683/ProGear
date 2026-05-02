import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Phone, MapPin, FileText, ShoppingCart, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { getMe } from '../../api/users';
import { listOrders } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { LoadingCenter } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { initials, getRoleLabel, getRoleColor, getOrderStatusLabel, getOrderStatusColor, formatCurrency } from '../../utils/format';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ProfilePage() {
  const { user: ctxUser } = useAuth();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    initialData: ctxUser ?? undefined,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.Status === 'reserved' || o.Status === 'checked_out').length;
  const completedOrders = orders.filter(o => o.Status === 'completed' || o.Status === 'returned').length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
    .slice(0, 5);

  if (isLoading) return <LoadingCenter />;
  if (!user) return <div className="alert alert-error">Failed to load profile</div>;

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-subtitle">Your account information</div>
        </div>
      </div>

      {error && <div className="alert alert-warning mb-4">Data may be outdated</div>}

      {/* Avatar and name */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800, flexShrink: 0,
            }}>
              {initials(user.Name)}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)' }}>{user.Name}</div>
              <div style={{ marginTop: 6 }}>
                <Badge color={getRoleColor(user.Role)}>{getRoleLabel(user.Role)}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FileText size={16} color="var(--color-primary)" />
            <div className="stat-card-label">Total Orders</div>
          </div>
          <div className="stat-card-value">{totalOrders}</div>
          <div className="stat-card-sub">all time</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <ShoppingCart size={16} color="var(--color-warning)" />
            <div className="stat-card-label">Active</div>
          </div>
          <div className="stat-card-value">{activeOrders}</div>
          <div className="stat-card-sub">in progress</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CheckCircle size={16} color="var(--color-success)" />
            <div className="stat-card-label">Completed</div>
          </div>
          <div className="stat-card-value">{completedOrders}</div>
          <div className="stat-card-sub">done</div>
        </div>
      </div>

      {/* Personal details */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title">Personal Details</span></div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={18} color="var(--color-primary)" />
              </div>
              <div>
                <div className="detail-label">Full Name</div>
                <div className="detail-value">{user.Name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={18} color="var(--color-primary)" />
              </div>
              <div>
                <div className="detail-label">Email</div>
                <div className="detail-value">{user.Email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={18} color="var(--color-primary)" />
              </div>
              <div>
                <div className="detail-label">Phone</div>
                <div className="detail-value">{user.Phone || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={18} color="var(--color-primary)" />
              </div>
              <div>
                <div className="detail-label">Address</div>
                <div className="detail-value">{user.Address || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={18} color="var(--color-primary)" />
              </div>
              <div>
                <div className="detail-label">Role</div>
                <div className="detail-value">{getRoleLabel(user.Role)}</div>
              </div>
            </div>

          </div>
        </div>
        <div className="card-footer">
          <div className="text-sm text-muted">Contact an administrator to change your details</div>
        </div>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} /> Recent Orders
            </span>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12 }}
              onClick={() => navigate('/orders')}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentOrders.map((order, idx) => (
              <div
                key={order.ID}
                onClick={() => navigate(`/orders/${order.ID}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px', cursor: 'pointer',
                  borderTop: idx > 0 ? '1px solid var(--color-border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={16} color="var(--color-text-muted)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Order #{order.ID}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(order.CreatedAt)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Badge color={getOrderStatusColor(order.Status)}>{getOrderStatusLabel(order.Status)}</Badge>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{formatCurrency(order.TotalAmount)}</div>
                  <ArrowRight size={14} color="var(--color-text-light)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
