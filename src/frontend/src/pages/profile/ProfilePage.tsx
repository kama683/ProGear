import { useQuery } from '@tanstack/react-query';
import { User, Mail, Shield } from 'lucide-react';
import { getMe } from '../../api/users';
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

  if (isLoading) return <LoadingCenter />;

  if (!user) return <div className="alert alert-error">Не удалось загрузить профиль</div>;

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Профиль</div>
          <div className="page-subtitle">Информация о вашем аккаунте</div>
        </div>
      </div>

      {error && <div className="alert alert-warning mb-4">Данные могут быть неактуальны</div>}

      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
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

          <div className="divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
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
          <div className="text-sm text-muted">Изменение профиля недоступно в текущей версии</div>
        </div>
      </div>

      <div className="alert alert-info mt-4">
        <div>Для изменения данных аккаунта обратитесь к администратору системы.</div>
      </div>
    </div>
  );
}
