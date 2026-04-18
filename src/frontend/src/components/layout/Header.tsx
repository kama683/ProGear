import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titleMap: Record<string, string> = {
  '/dashboard': 'Обзор',
  '/equipment': 'Оборудование',
  '/equipment/new': 'Добавить оборудование',
  '/rentals': 'Аренда оборудования',
  '/orders': 'Заказы',
  '/orders/new': 'Создать заказ',
  '/profile': 'Профиль',
  '/admin/users': 'Управление пользователями',
};

function getTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.startsWith('/equipment/') && pathname.endsWith('/edit')) return 'Редактировать оборудование';
  if (pathname.startsWith('/equipment/')) return 'Оборудование';
  if (pathname.startsWith('/orders/')) return 'Детали заказа';
  return 'ProGear';
}

interface HeaderProps { onMenuClick: () => void; }

export function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation();

  return (
    <header className="header">
      <button
        className="btn btn-ghost btn-icon"
        onClick={onMenuClick}
        style={{ display: 'none' }}
        id="mobile-menu-btn"
        aria-label="Меню"
      >
        <Menu size={20} />
      </button>
      <div className="header-title">{getTitle(pathname)}</div>
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
