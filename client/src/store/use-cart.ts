// use-cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

// تحديث واجهة عنصر السلة لتشمل الأحجام الأربعة والملاحظات
export interface CartItem extends Product {
  quantity: number;
  selectedSize: "small" | "medium" | "large" | "xlarge";
  customNotes: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (product: Product & { selectedSize?: "small" | "medium" | "large" | "xlarge"; customNotes?: string }, quantity: number) => void;
  removeItem: (productId: number, size: "small" | "medium" | "large" | "xlarge") => void;
  updateQuantity: (productId: number, size: "small" | "medium" | "large" | "xlarge", quantity: number) => void;
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
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const size = product.selectedSize || "medium";
          const notes = product.customNotes || "";

          // البحث عن المنتج بنفس المعرف ونفس الحجم ونفس الملاحظة
          const existingItem = state.items.find(
            (item) => item.id === product.id && item.selectedSize === size && item.customNotes === notes
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                (item.id === product.id && item.selectedSize === size && item.customNotes === notes)
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isOpen: true
            };
          }

          return { 
            items: [...state.items, { ...product, quantity, selectedSize: size, customNotes: notes } as CartItem], 
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
          // حساب السعر الافتراضي العام أولاً
          let price = Number(item.price);
          
          // اعتماد سعر المقاس المناسب بناءً على الحقول الجديدة في الـ Schema
          if (item.selectedSize === "small" && (item as any).priceS && Number((item as any).priceS) > 0) price = Number((item as any).priceS);
          if (item.selectedSize === "medium" && (item as any).priceM && Number((item as any).priceM) > 0) price = Number((item as any).priceM);
          if (item.selectedSize === "large" && (item as any).priceL && Number((item as any).priceL) > 0) price = Number((item as any).priceL);
          if (item.selectedSize === "xlarge" && (item as any).priceXL && Number((item as any).priceXL) > 0) price = Number((item as any).priceXL);
          
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
    }
  )
);