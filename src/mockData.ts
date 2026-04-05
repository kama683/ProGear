// ─── ProGear Mock Data ─────────────────────────────────────────────────────────
import type { Product, Order, LogEntry, NavCategory } from './types';

export const NAV_CATEGORIES: NavCategory[] = [
  { id: 'kits',      label: 'Комплекты',            icon: 'LayoutGrid' },
  { id: 'cameras',   label: 'Камеры',               icon: 'Camera',       subcategories: ['Cinema', 'DSLR/Mirrorless', 'Action'] },
  { id: 'optics',    label: 'Оптика',               icon: 'Aperture',     subcategories: ['Кино-объективы', 'Фото-объективы'] },
  { id: 'light',     label: 'Свет',                 icon: 'Zap',          subcategories: ['LED прожекторы', 'Панели', 'Импульс'] },
  { id: 'stab',      label: 'Стабилизация',         icon: 'Activity' },
  { id: 'monitors',  label: 'Мониторы и аксессуары', icon: 'Monitor',     subcategories: ['Режиссёрские', 'Накамерные'] },
  { id: 'grip',      label: 'Grip',                 icon: 'Wrench' },
  { id: 'audio',     label: 'Аудио',                icon: 'Mic',          subcategories: ['Петличные', 'Накамерные', 'Рекордеры'] },
  { id: 'radio',     label: 'Радио',                icon: 'Radio' },
  { id: 'memory',    label: 'Карты памяти и питание', icon: 'Battery',    subcategories: ['Карты памяти', 'Аккумуляторы'] },
  { id: 'cables',    label: 'Кабеля',               icon: 'Cable' },
  { id: 'second',    label: 'Комиссионный магазин',  icon: 'Tag' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-001', name: 'Sony FX6 + V-mount', category: 'Комплекты',
    price: 60_000, priceHalf: 42_000,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
    description: 'Профессиональная кинокамера Sony FX6 с V-mount батареей',
    specs: { Матрица: 'Full-Frame BSI CMOS', ISO: '80 – 102400', Разрешение: '4K/120fps' },
    inStock: true, isFeatured: true,
  },
  {
    id: 'p-002', name: 'Sony A7S III', category: 'Камеры',
    price: 16_500, priceHalf: 11_000,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80',
    specs: { Матрица: 'Full-Frame', ISO: '80 – 409600' },
    inStock: true,
  },
  {
    id: 'p-003', name: 'Aputure LS 1200d Pro', category: 'Свет',
    price: 30_000, priceHalf: 21_000,
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80',
    specs: { Мощность: '1200W', CCT: '5600K', Угол: '35°' },
    inStock: true,
  },
  {
    id: 'p-004', name: 'DJI Wireless Microphone', category: 'Аудио',
    price: 5_500, priceHalf: 3_900,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80',
    specs: { Дальность: '250м', Запись: '2-канальная', Батарея: '15ч' },
    inStock: true, isNew: true,
  },
  {
    id: 'p-005', name: 'Monitor SWIT BM-H215', category: 'Мониторы и аксессуары',
    price: 21_000, priceHalf: 14_700,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
    specs: { Диагональ: '21.5"', Разрешение: '1920×1080', HDR: 'Да' },
    inStock: true,
  },
  {
    id: 'p-006', name: 'Sandisk 256GB 200Mb/s', category: 'Карты памяти',
    price: 2_300, priceHalf: 1_600,
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80',
    specs: { Скорость: '200Mb/s', Тип: 'SDXC', Объём: '256GB' },
    inStock: true,
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001', productId: 'p-001', productName: 'Sony FX6 + V-mount',
    productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80',
    status: 'in-use', createdAt: '2024-07-01T09:00:00Z', updatedAt: '2024-07-01T10:30:00Z',
    renterName: 'Алибек Джаксыбеков', pricePerDay: 60_000,
  },
  {
    id: 'ord-002', productId: 'p-004', productName: 'DJI Wireless Microphone',
    productImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    status: 'created', createdAt: '2024-07-02T14:00:00Z', updatedAt: '2024-07-02T14:00:00Z',
    renterName: 'Сания Ермекова', pricePerDay: 5_500,
  },
  {
    id: 'ord-003', productId: 'p-003', productName: 'Aputure LS 1200d Pro',
    productImage: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200&q=80',
    status: 'returned', createdAt: '2024-06-28T08:00:00Z', updatedAt: '2024-06-30T18:00:00Z',
    renterName: 'Данияр Мусин', pricePerDay: 30_000,
  },
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log-001', timestamp: new Date().toISOString(), level: 'info',
    message: 'ProGear service initialised successfully', source: 'system',
  },
  {
    id: 'log-002', timestamp: new Date().toISOString(), level: 'cache',
    message: 'Orders loaded from in-memory cache (3 records)', source: 'cache',
  },
  {
    id: 'log-003', timestamp: new Date().toISOString(), level: 'success',
    message: 'Product catalogue hydrated — 6 items available', source: 'database',
  },
];
