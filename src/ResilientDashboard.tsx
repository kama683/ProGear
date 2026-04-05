// ─── ResilientDashboard ───────────────────────────────────────────────────────
// Shows the orders list, cache health indicator, and the OrderStatusStepper.
import React, { useState } from 'react';
import { Database, Zap, RefreshCw, Plus, X } from 'lucide-react';
import type { Order, CacheStatus } from './types';
import { OrderStatusStepper } from './OrderStatusStepper';
import { MOCK_PRODUCTS } from './mockData';

interface Props {
  orders: Order[];
  cacheStatus: CacheStatus;
  onAdvanceStatus: (id: string) => void;
  onInvalidateCache: () => void;
  onAddOrder: (order: Order) => void;
}

function uid() { return `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

export const ResilientDashboard: React.FC<Props> = ({
  orders, cacheStatus, onAdvanceStatus, onInvalidateCache, onAddOrder,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ productId: MOCK_PRODUCTS[0].id, renterName: '' });

  const handleAddOrder = () => {
    if (!formData.renterName.trim()) return;
    const product = MOCK_PRODUCTS.find(p => p.id === formData.productId)!;
    onAddOrder({
      id: uid(),
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      renterName: formData.renterName.trim(),
      pricePerDay: product.price,
    });
    setFormData({ productId: MOCK_PRODUCTS[0].id, renterName: '' });
    setShowForm(false);
  };

  const byStatus = {
    created:  orders.filter(o => o.status === 'created'),
    'in-use': orders.filter(o => o.status === 'in-use'),
    returned: orders.filter(o => o.status === 'returned'),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Cache Status Banner ───────────────────────────────────────── */}
      <div
        className="glass flex flex-wrap items-center gap-4 px-5 py-4 rounded-2xl"
        style={{ border: `1px solid ${cacheStatus.hit ? 'var(--border-accent)' : 'var(--border)'}` }}
      >
        {/* Cache hit indicator */}
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: cacheStatus.hit ? 'var(--log-cache)' : 'var(--log-info)',
              boxShadow: `0 0 8px ${cacheStatus.hit ? 'rgba(167,139,250,0.6)' : 'rgba(56,189,248,0.6)'}`,
            }}
          />
          <span className="text-xs font-display font-semibold" style={{ color: cacheStatus.hit ? 'var(--log-cache)' : 'var(--log-info)' }}>
            {cacheStatus.hit ? '⚡ Cache HIT' : '🗄 Cache MISS'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Database size={12} />
          {cacheStatus.totalOrders} заказов загружено
        </div>

        {cacheStatus.lastFetched && (
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Последнее чтение: {new Date(cacheStatus.lastFetched).toLocaleTimeString('ru-KZ')}
          </div>
        )}

        {cacheStatus.stale && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--log-warn)', border: '1px solid rgba(251,191,36,0.3)' }}>
            stale — cache invalidated
          </span>
        )}

        <div className="ml-auto flex gap-2">
          <button
            onClick={onInvalidateCache}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--log-warn)', border: '1px solid rgba(251,191,36,0.25)' }}
          >
            <RefreshCw size={11} /> Инвалидировать кэш
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="btn-accent flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          >
            <Plus size={11} /> Новый заказ
          </button>
        </div>
      </div>

      {/* ── New Order Form ────────────────────────────────────────────── */}
      {showForm && (
        <div className="glass-accent rounded-2xl p-5 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-40">
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>Оборудование</label>
            <select
              value={formData.productId}
              onChange={e => setFormData(v => ({ ...v, productId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              {MOCK_PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.price.toLocaleString('ru-KZ')} ₸/день</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>Арендатор</label>
            <input
              value={formData.renterName}
              onChange={e => setFormData(v => ({ ...v, renterName: e.target.value }))}
              placeholder="Имя арендатора"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddOrder} className="btn-accent px-4 py-2 rounded-lg text-sm">Создать</button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Stats Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {([
          { key: 'created',  label: 'Созданы',    color: 'var(--status-created)',  count: byStatus.created.length },
          { key: 'in-use',   label: 'В аренде',   color: 'var(--status-in-use)',   count: byStatus['in-use'].length },
          { key: 'returned', label: 'Возвращены', color: 'var(--status-returned)', count: byStatus.returned.length },
        ] as const).map(stat => (
          <div key={stat.key} className="glass rounded-xl p-4 flex items-center gap-3"
            style={{ border: `1px solid ${stat.color}33` }}>
            <div className="w-2 h-8 rounded-full" style={{ background: stat.color, boxShadow: `0 0 12px ${stat.color}` }} />
            <div>
              <p className="text-2xl font-display font-bold" style={{ color: stat.color }}>{stat.count}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Orders Grid ───────────────────────────────────────────────── */}
      {orders.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <Zap size={32} className="mx-auto mb-3 opacity-30" />
          <p>Заказов пока нет</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map(order => (
            <OrderStatusStepper key={order.id} order={order} onAdvance={onAdvanceStatus} />
          ))}
        </div>
      )}
    </div>
  );
};
