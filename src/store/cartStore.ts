import { create } from 'zustand';
import type { CartItem } from '@/types/shop';
import { getIngredientById } from '@/data/shopData';

interface CartStore {
  items: CartItem[];
  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
  addCombo: (ingredients: { itemId: string; quantity: number }[]) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (itemId, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((item) => item.itemId === itemId);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.itemId === itemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return {
        items: [...state.items, { itemId, quantity }],
      };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.itemId !== itemId),
    }));
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.itemId === itemId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => {
      const ingredient = getIngredientById(item.itemId);
      return sum + (ingredient?.price || 0) * item.quantity;
    }, 0);
  },

  addCombo: (ingredients) => {
    ingredients.forEach((ing) => {
      get().addItem(ing.itemId, ing.quantity);
    });
  },
}));
