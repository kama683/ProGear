import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface CartItem {
  id: string;
  equipmentId: number;
  equipmentName: string;
  category: string;
  itemType: 'rental' | 'sale';
  quantity: number;
  dailyRate: string;
  salePrice: string;
  startAt?: string;
  endAt?: string;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<CartItem>) => void;
  clearCart: () => void;
  isInCart: (equipmentId: number, itemType: 'rental' | 'sale') => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'progear_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    const id = `${item.equipmentId}-${item.itemType}-${Date.now()}`;
    setItems(prev => {
      const existing = prev.find(i => i.equipmentId === item.equipmentId && i.itemType === item.itemType);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, { ...item, id }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<CartItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback((equipmentId: number, itemType: 'rental' | 'sale') => {
    return items.some(i => i.equipmentId === equipmentId && i.itemType === itemType);
  }, [items]);

  return (
    <CartContext.Provider value={{
      items,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen(p => !p),
      addItem,
      removeItem,
      updateItem,
      clearCart,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
