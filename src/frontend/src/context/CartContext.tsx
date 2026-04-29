import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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

interface CartContextType {
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

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'progear_cart';

function loadCartFromStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [isOpen, setIsOpen] = useState(false);

  // save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: Omit<CartItem, 'id'>) {
    const newId = `${item.equipmentId}-${item.itemType}-${Date.now()}`;

    const alreadyInCart = items.find(
      i => i.equipmentId === item.equipmentId && i.itemType === item.itemType
    );

    if (alreadyInCart) {
      // just increase quantity instead of adding a duplicate
      setItems(items.map(i =>
        i.id === alreadyInCart.id
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      ));
    } else {
      setItems([...items, { ...item, id: newId }]);
    }

    setIsOpen(true);
  }

  function removeItem(id: string) {
    setItems(items.filter(item => item.id !== id));
  }

  function updateItem(id: string, patch: Partial<CartItem>) {
    setItems(items.map(item => item.id === id ? { ...item, ...patch } : item));
  }

  function clearCart() {
    setItems([]);
  }

  function isInCart(equipmentId: number, itemType: 'rental' | 'sale') {
    return items.some(item => item.equipmentId === equipmentId && item.itemType === itemType);
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen(prev => !prev),
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
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be inside CartProvider');
  return context;
}
