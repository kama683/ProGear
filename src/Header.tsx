// ─── Header ───────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, LogIn, UserPlus } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  activeTab: 'catalogue' | 'dashboard' | 'logs';
  onTabChange: (tab: 'catalogue' | 'dashboard' | 'logs') => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, activeTab, onTabChange }) => {
  const [searchFocused, setSearchFocused] = useState(false);

  const tabs = [
    { id: 'catalogue' as const, label: 'Каталог' },
    { id: 'dashboard' as const, label: 'Заказы' },
    { id: 'logs'      as const, label: 'Логи' },
  ];

  return (
    <header
      className="flex items-center gap-4 px-6"
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 40,
      }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-2 flex-1 max-w-sm rounded-lg px-3 py-2 transition-all duration-200"
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${searchFocused ? 'var(--border-accent)' : 'var(--border)'}`,
          boxShadow: searchFocused ? '0 0 0 3px var(--accent-dim)' : 'none',
        }}
      >
        <Search size={14} style={{ color: 'var(--text-secondary)' }} />
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-sm"
          style={{ color: 'var(--text-primary)' }}
          placeholder="Поиск оборудования..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1 mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
            style={{
              color:      activeTab === tab.id ? 'var(--accent)'        : 'var(--text-secondary)',
              background: activeTab === tab.id ? 'var(--accent-dim)'    : 'transparent',
              border:     activeTab === tab.id ? '1px solid var(--border-accent)' : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Cart */}
        <button className="relative flex flex-col items-center gap-0.5 transition-opacity hover:opacity-80">
          <div className="relative">
            <ShoppingCart size={20} style={{ color: 'var(--text-secondary)' }} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'var(--accent)', color: '#09090b' }}
              >
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Корзина</span>
        </button>

        {/* Favourites */}
        <button className="flex flex-col items-center gap-0.5 transition-opacity hover:opacity-80">
          <Heart size={20} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Избранное</span>
        </button>

        {/* Auth buttons */}
        <button
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ border: '1px solid var(--border-accent)', color: 'var(--accent)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogIn size={14} />
          Войти
        </button>
        <button
          className="btn-accent flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm"
        >
          <UserPlus size={14} />
          Создать аккаунт
        </button>
      </div>
    </header>
  );
};
