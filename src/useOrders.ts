// ─── useOrders ────────────────────────────────────────────────────────────────
// Manages the orders state with:
//   • In-memory cache (simulates a server-side cache layer)
//   • localStorage persistence for page refreshes
//   • Linear status validation: created → in-use → returned
//   • Log emission for every meaningful event

import { useState, useCallback } from 'react';
import type { Order, OrderStatus, LogEntry, CacheStatus } from './types';
import { MOCK_ORDERS } from './mockData';
import { useLocalStorage } from './useLocalStorage';

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_PROGRESSION: OrderStatus[] = ['created', 'in-use', 'returned'];

/** Returns true if `next` is the immediate successor of `current` */
function isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
  const ci = STATUS_PROGRESSION.indexOf(current);
  const ni = STATUS_PROGRESSION.indexOf(next);
  return ni === ci + 1;
}

function uid() {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── In-memory "server" cache ─────────────────────────────────────────────────
// Simulates what a Redis / in-process cache would hold on the backend.
let memoryCache: Order[] | null = null;
let cacheFetchedAt: string | null = null;

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useOrders(onLog: (entry: LogEntry) => void) {
  const [persisted, setPersisted] = useLocalStorage<Order[]>('progear:orders', MOCK_ORDERS);
  const [orders, setOrders] = useState<Order[]>(() => {
    // On first render: check memory cache first, then fall back to localStorage
    if (memoryCache) {
      onLog({ id: uid(), timestamp: new Date().toISOString(), level: 'cache',
               message: `Cache HIT — loaded ${memoryCache.length} orders from memory`, source: 'cache' });
      return memoryCache;
    }
    // "Database" read (localStorage playing the role of the DB/file)
    const data = persisted;
    memoryCache = data;
    cacheFetchedAt = new Date().toISOString();
    onLog({ id: uid(), timestamp: new Date().toISOString(), level: 'info',
             message: `Cache MISS — fetched ${data.length} orders from database`, source: 'database' });
    return data;
  });

  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    hit: !!memoryCache,
    lastFetched: cacheFetchedAt,
    totalOrders: orders.length,
    stale: false,
  });

  // ── Mutators ───────────────────────────────────────────────────────────────

  const advanceStatus = useCallback((orderId: string) => {
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId);
      if (!order) return prev;

      const ci = STATUS_PROGRESSION.indexOf(order.status);
      if (ci === STATUS_PROGRESSION.length - 1) return prev; // already terminal

      const nextStatus = STATUS_PROGRESSION[ci + 1];
      const updated: Order = { ...order, status: nextStatus, updatedAt: new Date().toISOString() };
      const next = prev.map(o => o.id === orderId ? updated : o);

      // Sync cache & localStorage
      memoryCache = next;
      setPersisted(next);
      setCacheStatus(s => ({ ...s, hit: false, stale: true, totalOrders: next.length }));

      onLog({
        id: uid(), timestamp: new Date().toISOString(), level: 'success',
        message: `Order ${orderId}: status changed [${order.status}] → [${nextStatus}]`,
        source: 'user',
      });

      return next;
    });
  }, [onLog, setPersisted]);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => {
      const next = [order, ...prev];
      memoryCache = next;
      setPersisted(next);
      setCacheStatus(s => ({ ...s, hit: false, stale: true, totalOrders: next.length }));
      onLog({ id: uid(), timestamp: new Date().toISOString(), level: 'info',
               message: `New order created: ${order.productName} for ${order.renterName}`, source: 'user' });
      return next;
    });
  }, [onLog, setPersisted]);

  const invalidateCache = useCallback(() => {
    memoryCache = null;
    cacheFetchedAt = null;
    setCacheStatus({ hit: false, lastFetched: null, totalOrders: orders.length, stale: true });
    onLog({ id: uid(), timestamp: new Date().toISOString(), level: 'warn',
             message: 'Cache manually invalidated — next read will hit database', source: 'system' });
  }, [orders.length, onLog]);

  return {
    orders,
    cacheStatus,
    advanceStatus,
    addOrder,
    invalidateCache,
    isValidTransition,
    STATUS_PROGRESSION,
  };
}
