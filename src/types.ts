// ─── ProGear Types ─────────────────────────────────────────────────────────────

/** Stateful workflow stages for an Order — must progress linearly */
export type OrderStatus = 'created' | 'in-use' | 'returned';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  status: OrderStatus;
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  renterName: string;
  pricePerDay: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;           // daily rate in KZT (₸)
  priceHalf?: number;      // half-shift (6h) rate
  image?: string;
  description?: string;
  specs?: Record<string, string>;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

/** Single log entry mirroring a backend log.txt line */
export interface LogEntry {
  id: string;
  timestamp: string;       // ISO timestamp
  level: 'info' | 'warn' | 'error' | 'success' | 'cache';
  message: string;
  /** Origin of the data – cache hit vs. file/DB read */
  source: 'cache' | 'database' | 'system' | 'user';
}

/** Status metadata for cache indication UI */
export interface CacheStatus {
  hit: boolean;
  lastFetched: string | null;   // ISO timestamp
  totalOrders: number;
  stale: boolean;
}

/** Navigation category for the Sidebar */
export interface NavCategory {
  id: string;
  label: string;
  icon: string;             // lucide icon name
  subcategories?: string[];
}
