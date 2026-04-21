import { useQuery } from '@tanstack/react-query';
import { User, Mail, Shield, FileText, ShoppingCart, CheckCircle } from 'lucide-react';
import { getMe } from '../../api/users';
import { listOrders } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { LoadingCenter } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { initials, getRoleLabel, getRoleColor } from '../../utils/format';

export function ProfilePage() {
  const { user: ctxUser } = useAuth();

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
  const completedOrders = orders.filter(o => o.Status === 'completed').length;

  if (isLoading) return <LoadingCenter />;
  if (!user) return <div className="alert alert-error">Не удалось загрузить профиль</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Профиль</div>
          <div className="page-subtitle">Информация о вашем аккаунте</div>
        </div>
      </div>

      {error && <div className="alert alert-warning mb-4">Данные могут быть неактуальны</div>}

      {/* Аватар и имя */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
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

      {/* Статистика */}
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FileText size={16} color="var(--color-primary)" />
            <div className="stat-card-label">Всего заказов</div>
          </div>
          <div className="stat-card-value">{totalOrders}</div>
          <div className="stat-card-sub">за всё время</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <ShoppingCart size={16} color="var(--color-warning)" />
            <div className="stat-card-label">Активные</div>
          </div>
          <div className="stat-card-value">{activeOrders}</div>
          <div className="stat-card-sub">в процессе</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CheckCircle size={16} color="var(--color-success)" />
            <div className="stat-card-label">Завершённые</div>
          </div>
          <div className="stat-card-value">{completedOrders}</div>
          <div className="stat-card-sub">выполнено</div>
        </div>
      </div>

      {/* Личные данные */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Личные данные</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={18} color="var(--color-primary)" />
              </div>
              <div>
                <div className="detail-label">Полное имя</div>
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
                <Shield size={18} color="var(--color-primary)" />
              </div>
              <div>
                <div className="detail-label">Роль</div>
                <div className="detail-value">{getRoleLabel(user.Role)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 16, color: 'var(--color-primary)', fontWeight: 700 }}>#</span>
              </div>
              <div>
                <div className="detail-label">ID пользователя</div>
                <div className="detail-value">#{user.ID}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <div className="text-sm text-muted">Для изменения данных обратитесь к администратору</div>
        </div>
      </div>
    </div>
  );
}
