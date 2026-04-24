import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titleMap: Record<string, string> = {
  '/dashboard': 'Overview',
  '/equipment': 'Equipment',
  '/equipment/new': 'Add Equipment',
  '/rentals': 'Equipment Rental',
  '/orders': 'Orders',
  '/orders/new': 'Create Order',
  '/profile': 'Profile',
  '/admin/users': 'User Management',
};

function getTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.startsWith('/equipment/') && pathname.endsWith('/edit')) return 'Edit Equipment';
  if (pathname.startsWith('/equipment/')) return 'Equipment';
  if (pathname.startsWith('/orders/')) return 'Order Details';
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
        aria-label="Menu"
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
