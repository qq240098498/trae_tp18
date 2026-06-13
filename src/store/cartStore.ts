import { create } from 'zustand';
import type { CartItem } from '@/types/shop';
import {
  getIngredientById,
  getAvailableStock,
  deductComboStock,
  restoreComboStock,
  subscribeStockUpdate,
} from '@/data/shopData';

export interface StockError {
  itemId: string;
  itemName: string;
  available: number;
  requested: number;
}

interface CartStore {
  items: CartItem[];
  stockError: StockError | null;
  stockVersion: number;
  addItem: (itemId: string, quantity?: number) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => boolean;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
  addCombo: (ingredients: { itemId: string; quantity: number }[]) => { success: boolean; errors: StockError[] };
  getAvailableStock: (itemId: string) => number;
  getCartQuantity: (itemId: string) => number;
  canAddItem: (itemId: string, quantity?: number) => boolean;
  clearStockError: () => void;
  checkComboStock: (ingredients: { itemId: string; quantity: number }[]) => { available: boolean; errors: StockError[] };
  checkout: () => { success: boolean; errors: StockError[] };
  restoreCartStock: () => void;
}

export const useCartStore = create<CartStore>((set, get) => {
  subscribeStockUpdate(() => {
    set({ stockVersion: Date.now() });
  });

  return {
    items: [],
    stockError: null,
    stockVersion: 0,

    getAvailableStock: (itemId) => {
      return getAvailableStock(itemId);
    },

    getCartQuantity: (itemId) => {
      const item = get().items.find((i) => i.itemId === itemId);
      return item?.quantity || 0;
    },

    canAddItem: (itemId, quantity = 1) => {
      const available = get().getAvailableStock(itemId);
      const inCart = get().getCartQuantity(itemId);
      return inCart + quantity <= available && available > 0;
    },

    clearStockError: () => {
      set({ stockError: null });
    },

    checkComboStock: (ingredients) => {
      const errors: StockError[] = [];
      ingredients.forEach((ing) => {
        const ingredient = getIngredientById(ing.itemId);
        if (ingredient) {
          const inCart = get().getCartQuantity(ing.itemId);
          const requested = inCart + ing.quantity;
          if (requested > ingredient.stock || ingredient.stock === 0) {
            errors.push({
              itemId: ing.itemId,
              itemName: ingredient.name,
              available: ingredient.stock,
              requested: ing.quantity,
            });
          }
        }
      });
      return { available: errors.length === 0, errors };
    },

    addItem: (itemId, quantity = 1) => {
      const ingredient = getIngredientById(itemId);
      if (!ingredient) return false;

      const available = ingredient.stock;
      const inCart = get().getCartQuantity(itemId);
      const newQuantity = inCart + quantity;

      if (available === 0) {
        set({
          stockError: {
            itemId,
            itemName: ingredient.name,
            available,
            requested: quantity,
          },
        });
        return false;
      }

      if (newQuantity > available) {
        set({
          stockError: {
            itemId,
            itemName: ingredient.name,
            available,
            requested: quantity,
          },
        });
        return false;
      }

      set((state) => {
        const existing = state.items.find((item) => item.itemId === itemId);
        if (existing) {
          return {
            items: state.items.map((item) =>
              item.itemId === itemId ? { ...item, quantity: item.quantity + quantity } : item
            ),
            stockError: null,
          };
        }
        return {
          items: [...state.items, { itemId, quantity }],
          stockError: null,
        };
      });
      return true;
    },

    removeItem: (itemId) => {
      set((state) => ({
        items: state.items.filter((item) => item.itemId !== itemId),
      }));
    },

    updateQuantity: (itemId, quantity) => {
      if (quantity <= 0) {
        get().removeItem(itemId);
        return true;
      }

      const ingredient = getIngredientById(itemId);
      if (!ingredient) return false;

      if (ingredient.stock === 0) {
        set({
          stockError: {
            itemId,
            itemName: ingredient.name,
            available: 0,
            requested: quantity,
          },
        });
        return false;
      }

      if (quantity > ingredient.stock) {
        set({
          stockError: {
            itemId,
            itemName: ingredient.name,
            available: ingredient.stock,
            requested: quantity,
          },
        });
        return false;
      }

      set((state) => ({
        items: state.items.map((item) => (item.itemId === itemId ? { ...item, quantity } : item)),
        stockError: null,
      }));
      return true;
    },

    clearCart: () => {
      set({ items: [], stockError: null });
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
      const { available, errors } = get().checkComboStock(ingredients);
      if (!available) {
        return { success: false, errors };
      }

      ingredients.forEach((ing) => {
        get().addItem(ing.itemId, ing.quantity);
      });
      return { success: true, errors: [] };
    },

    checkout: () => {
      const { items } = get();
      if (items.length === 0) {
        return { success: false, errors: [] };
      }

      const success = deductComboStock(items);
      if (!success) {
        const errors: StockError[] = [];
        items.forEach((cartItem) => {
          const ingredient = getIngredientById(cartItem.itemId);
          if (ingredient && cartItem.quantity > ingredient.stock) {
            errors.push({
              itemId: cartItem.itemId,
              itemName: ingredient.name,
              available: ingredient.stock,
              requested: cartItem.quantity,
            });
          }
        });
        return { success: false, errors };
      }

      set({ items: [], stockError: null });
      return { success: true, errors: [] };
    },

    restoreCartStock: () => {
      const { items } = get();
      if (items.length > 0) {
        restoreComboStock(items);
      }
    },
  };
});
