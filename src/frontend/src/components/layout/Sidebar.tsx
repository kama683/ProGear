import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, User, Users, LogOut, Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials, getRoleLabel } from '../../utils/format';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout, isAdmin, isCustomer, canManageEquipment } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <>
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">Pro<span style={{ color: '#60a5fa' }}>Gear</span></div>
          <div className="sidebar-logo-sub">Аренда и продажа оборудования</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Главное</div>
            <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
              <LayoutDashboard size={16} /> Обзор
            </NavLink>
            <NavLink to="/equipment" className={linkClass} onClick={onClose}>
              <Package size={16} /> Оборудование
            </NavLink>
          </div>

          {isCustomer && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Аренда</div>
              <NavLink to="/rentals" className={linkClass} onClick={onClose}>
                <ShoppingCart size={16} /> Забронировать
              </NavLink>
            </div>
          )}

          <div className="sidebar-section">
            <div className="sidebar-section-title">Заказы</div>
            <NavLink to="/orders" className={linkClass} onClick={onClose}>
              <FileText size={16} /> Мои заказы
            </NavLink>
          </div>

          {canManageEquipment && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Управление</div>
              <NavLink to="/equipment/new" className={linkClass} onClick={onClose}>
                <Package size={16} /> Добавить товар
              </NavLink>
            </div>
          )}

          {isAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Администрирование</div>
              <NavLink to="/admin/users" className={linkClass} onClick={onClose}>
                <Users size={16} /> Пользователи
              </NavLink>
            </div>
          )}

          <div className="sidebar-section">
            <div className="sidebar-section-title">Аккаунт</div>
            <NavLink to="/profile" className={linkClass} onClick={onClose}>
              <User size={16} /> Профиль
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{initials(user.Name)}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.Name}</div>
                <div className="sidebar-user-role">{getRoleLabel(user.Role)}</div>
              </div>
            </div>
          )}
          <button className="sidebar-link" onClick={handleLogout} style={{ color: '#f87171' }}>
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn btn-ghost btn-icon" onClick={onClick} style={{ display: 'none' }} id="menu-btn">
      <Menu size={20} />
    </button>
  );
}
