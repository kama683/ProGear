// ─── App.tsx ──────────────────────────────────────────────────────────────────
// Root component. Wires together:
//  • Sidebar  + Header   (layout chrome)
//  • ProductCard grid    (catalogue tab)
//  • ResilientDashboard  (orders tab)
//  • LoggerConsole       (logs tab)
// State: orders via useOrders, cart via useState, logs via useState.
import { useState, useCallback } from 'react';
import { Sidebar }            from './Sidebar';
import { Header }             from './Header';
import { ProductCard }        from './ProductCard';
import { ResilientDashboard } from './ResilientDashboard';
import { LoggerConsole }      from './LoggerConsole';
import { useOrders }          from './useOrders';
import { MOCK_PRODUCTS, INITIAL_LOGS } from './mockData';
import type { Product, LogEntry }      from './types';

type Tab = 'catalogue' | 'dashboard' | 'logs';

export default function App() {
  // ── Log stream ─────────────────────────────────────────────────────────────
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  const pushLog = useCallback((entry: LogEntry) => {
    setLogs(prev => [...prev, entry]);
  }, []);

  // ── Orders (resilient hook) ────────────────────────────────────────────────
  const { orders, cacheStatus, advanceStatus, addOrder, invalidateCache } = useOrders(pushLog);

  // ── Cart ───────────────────────────────────────────────────────────────────
  const [cartCount, setCartCount] = useState(1);   // starts at 1 (matches yume.rent mockup)

  const handleAddToCart = useCallback((product: Product) => {
    setCartCount(c => c + 1);
    const id = `log-cart-${Date.now()}`;
    pushLog({
      id, timestamp: new Date().toISOString(), level: 'info',
      message: `"${product.name}" added to cart (${product.price.toLocaleString('ru-KZ')} ₸/day)`,
      source: 'user',
    });
  }, [pushLog]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState('cameras');
  const [activeTab, setActiveTab] = useState<Tab>('catalogue');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Decorative scanline */}
      <div className="scanline" />

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Sidebar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header cartCount={cartCount} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Content ────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ── Catalogue ──────────────────────────────────────────────── */}
          {activeTab === 'catalogue' && (
            <div>
              {/* Section header */}
              <div className="mb-6">
                <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Каталог оборудования
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {MOCK_PRODUCTS.length} товаров · Профессиональная кино- и фото-техника
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex gap-2 mb-6">
                {['Без фильтров', 'Цена по возрастанию', 'Цена по убыванию'].map(f => (
                  <button
                    key={f}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all duration-150"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)',
                             border: '1px solid var(--border)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Product grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {MOCK_PRODUCTS.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            </div>
          )}

          {/* ── Dashboard ──────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Resilient Dashboard
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Управление заказами · Stateful Workflow: Created → In-Use → Returned
                </p>
              </div>
              <ResilientDashboard
                orders={orders}
                cacheStatus={cacheStatus}
                onAdvanceStatus={advanceStatus}
                onInvalidateCache={invalidateCache}
                onAddOrder={addOrder}
              />
            </div>
          )}

          {/* ── Logs ───────────────────────────────────────────────────── */}
          {activeTab === 'logs' && (
            <div className="flex flex-col h-[calc(100vh-var(--header-height)-3rem)]">
              <div className="mb-4 flex-shrink-0">
                <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Log Viewer
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Дублирует записи из log.txt · Показывает источник данных (cache / database)
                </p>
              </div>
              <div className="flex-1 min-h-0">
                <LoggerConsole logs={logs} onClear={() => setLogs([])} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
