// ─── Sidebar ──────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  LayoutGrid, Camera, Aperture, Zap, Activity, Monitor,
  Wrench, Mic, Radio, Battery, Cable, Tag, ChevronRight,
} from 'lucide-react';
import type { NavCategory } from './types';
import { NAV_CATEGORIES } from './mockData';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid, Camera, Aperture, Zap, Activity, Monitor,
  Wrench, Mic, Radio, Battery, Cable, Tag,
};

interface SidebarProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (id: string, hasSubs: boolean) => {
    if (hasSubs) {
      setExpanded(prev => (prev === id ? null : id));
    }
    onSelectCategory(id);
  };

  return (
    <aside
      className="flex flex-col h-full overflow-y-auto py-3"
      style={{ width: 'var(--sidebar-width)', background: 'var(--bg-secondary)',
               borderRight: '1px solid var(--border)' }}
    >
      {/* Brand */}
      <div className="px-5 pb-5 mb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="font-display text-xl font-800 tracking-tight" style={{ color: 'var(--text-primary)' }}>
          pro<span style={{ color: 'var(--accent)' }}>gear</span>
        </span>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Equipment Rental</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        {NAV_CATEGORIES.map((cat: NavCategory) => {
          const Icon = ICON_MAP[cat.icon] ?? LayoutGrid;
          const isActive = activeCategory === cat.id;
          const isOpen = expanded === cat.id;

          return (
            <div key={cat.id}>
              <button
                onClick={() => toggleExpand(cat.id, !!cat.subcategories?.length)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all duration-150 ${
                  isActive ? 'nav-active' : ''
                }`}
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
              >
                <Icon size={15} strokeWidth={1.8} className="flex-shrink-0" />
                <span className="flex-1 text-left font-medium truncate">{cat.label}</span>
                {cat.subcategories?.length && (
                  <ChevronRight
                    size={13}
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                )}
              </button>

              {/* Subcategories */}
              {isOpen && cat.subcategories && (
                <div className="ml-6 mb-1 pl-3" style={{ borderLeft: '1px solid var(--border)' }}>
                  {cat.subcategories.map(sub => (
                    <button
                      key={sub}
                      className="w-full text-left px-2 py-1.5 text-xs rounded transition-colors duration-100"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 mt-2 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <p>Казахстан, г.Алматы</p>
        <p className="mt-0.5">07:00 – 02:00 (без вых.)</p>
      </div>
    </aside>
  );
};
