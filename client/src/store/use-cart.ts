import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

// تحديث واجهة عنصر السلة لتشمل الحجم والسعر المختار
export interface CartItem extends Product {
  quantity: number;
  selectedSize: "small" | "medium" | "large";
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  // إضافة الحجم كباراميتر أساسي عند الإضافة للسلة
  addItem: (product: Product, quantity: number, size: "small" | "medium" | "large") => void;
  removeItem: (productId: number, size: "small" | "medium" | "large") => void;
  updateQuantity: (productId: number, size: "small" | "medium" | "large", quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      
      addItem: (product, quantity = 1, size = "small") => {
        set((state) => {
          // البحث عن المنتج بنفس المعرف ونفس الحجم
          const existingItem = state.items.find(
            (item) => item.id === product.id && item.selectedSize === size
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id && item.selectedSize === size
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isOpen: true,
            };
          }
          
          // إضافة عنصر جديد مع تحديد الحجم المختار
          return { 
            items: [...state.items, { ...product, quantity, selectedSize: size }], 
            isOpen: true 
          };
        });
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === productId && item.selectedSize === size)
          ),
        }));
      },

      updateQuantity: (productId, size, quantity) => {
        set((state) => ({
          items: quantity <= 0 
            ? state.items.filter((item) => !(item.id === productId && item.selectedSize === size))
            : state.items.map((item) =>
                (item.id === productId && item.selectedSize === size) 
                  ? { ...item, quantity } 
                  : item
              ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          // اختيار السعر الصحيح بناءً على الحجم المخزن في العنصر
          let price = Number(item.priceSmall);
          if (item.selectedSize === "medium") price = Number(item.priceMedium);
          if (item.selectedSize === "large") price = Number(item.priceLarge);
          
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'flower-shop-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);