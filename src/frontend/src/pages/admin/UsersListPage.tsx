import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { listUsers } from '../../api/users';
import { LoadingCenter } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { getRoleLabel, getRoleColor, initials } from '../../utils/format';

export function UsersListPage() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
  });

  if (isLoading) return <LoadingCenter />;

  const byRole = {
    admin: users.filter(u => u.Role === 'admin').length,
    manager: users.filter(u => u.Role === 'manager').length,
    customer: users.filter(u => u.Role === 'customer').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Пользователи</div>
          <div className="page-subtitle">Все зарегистрированные пользователи системы</div>
        </div>
      </div>

      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-card-label">Всего</div>
          <div className="stat-card-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Администраторов</div>
          <div className="stat-card-value">{byRole.admin}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Менеджеров</div>
          <div className="stat-card-value">{byRole.manager}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Клиентов</div>
          <div className="stat-card-value">{byRole.customer}</div>
        </div>
      </div>

      {error ? (
        <div className="alert alert-error">Ошибка загрузки: {(error as Error).message}</div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Users size={24} />} title="Пользователей нет" description="Нет зарегистрированных пользователей" />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Email</th>
                <th>Роль</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.ID}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {initials(user.Name)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.Name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{user.Email}</td>
                  <td><Badge color={getRoleColor(user.Role)}>{getRoleLabel(user.Role)}</Badge></td>
                  <td className="text-muted text-sm">#{user.ID}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
