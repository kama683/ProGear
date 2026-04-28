import { Menu, ShoppingBag } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const titleMap: Record<string, string> = {
  '/dashboard': 'Overview',
  '/equipment': 'Equipment',
  '/equipment/new': 'Add Equipment',
  '/rentals': 'Equipment Rental',
  '/orders': 'Orders',
  '/orders/new': 'Create Order',
  '/profile': 'Profile',
  '/admin/users': 'User Management',
  '/wishlist': 'Wishlist',
  '/cart': 'Cart',
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
  const { totalItems, toggleCart } = useCart();

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

      {/* Cart icon with badge */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={toggleCart}
        aria-label="Open cart"
        style={{ position: 'relative', marginLeft: 'auto' }}
      >
        <ShoppingBag size={20} />
        {totalItems > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: 'var(--color-primary)', color: '#fff',
            borderRadius: '50%', width: 16, height: 16,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}>
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </button>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
