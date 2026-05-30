// use-cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

// تعريف بنية الإضافات مثل الشوكولاتة والفازة
export interface CartAddon {
  id: string;
  name: string;
  price: number;
}

// تحديث واجهة عنصر السلة لتشمل الأحجام، الملاحظات، والإضافات الجديدة
export interface CartItem extends Product {
  quantity: number;
  selectedSize: "small" | "medium" | "large" | "xlarge";
  customNotes: string;
  selectedAddons: CartAddon[]; // الإضافات المرافقة للباقة
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (
    product: Product & { 
      selectedSize?: "small" | "medium" | "large" | "xlarge"; 
      customNotes?: string;
      selectedAddons?: CartAddon[];
    }, 
    quantity: number
  ) => void;
  removeItem: (productId: number, size: "small" | "medium" | "large" | "xlarge", addonsKey?: string) => void;
  updateQuantity: (productId: number, size: "small" | "medium" | "large" | "xlarge", quantity: number, addonsKey?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

// دالة مساعدة لمقارنة الإضافات للتأكد من تجميع المنتجات المتطابقة تماماً في السلة
const getAddonsKey = (addons: CartAddon[] = []) => {
  return addons.map(a => a.id).sort().join(',');
};

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
          const addons = product.selectedAddons || [];
          const addonsKey = getAddonsKey(addons);

          // البحث عن المنتج بنفس المعرف، الحجم، الملاحظة، ونفس الإضافات تماماً
          const existingItem = state.items.find(
            (item) => 
              item.id === product.id && 
              item.selectedSize === size && 
              item.customNotes === notes && 
              getAddonsKey(item.selectedAddons) === addonsKey
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                (item.id === product.id && item.selectedSize === size && item.customNotes === notes && getAddonsKey(item.selectedAddons) === addonsKey)
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isOpen: true
            };
          }

          return { 
            items: [...state.items, { ...product, quantity, selectedSize: size, customNotes: notes, selectedAddons: addons } as CartItem], 
            isOpen: true 
          };
        });
      },

      removeItem: (productId, size, addonsKey = "") => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === productId && item.selectedSize === size && (addonsKey === "" || getAddonsKey(item.selectedAddons) === addonsKey))
          ),
        }));
      },

      updateQuantity: (productId, size, quantity, addonsKey = "") => {
        set((state) => ({
          items: quantity <= 0 
            ? state.items.filter((item) => !(item.id === productId && item.selectedSize === size && (addonsKey === "" || getAddonsKey(item.selectedAddons) === addonsKey)))
            : state.items.map((item) =>
                (item.id === productId && item.selectedSize === size && (addonsKey === "" || getAddonsKey(item.selectedAddons) === addonsKey)) 
                  ? { ...item, quantity } 
                  : item
              ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          // 1. حساب سعر باقة الورد الافتراضي أولاً
          let price = Number(item.price);
          
          // اعتماد سعر المقاس المناسب بناءً على الحقول المحددة
          if (item.selectedSize === "small" && (item as any).priceS && Number((item as any).priceS) > 0) price = Number((item as any).priceS);
          if (item.selectedSize === "medium" && (item as any).priceM && Number((item as any).priceM) > 0) price = Number((item as any).priceM);
          if (item.selectedSize === "large" && (item as any).priceL && Number((item as any).priceL) > 0) price = Number((item as any).priceL);
          if (item.selectedSize === "xlarge" && (item as any).priceXL && Number((item as any).priceXL) > 0) price = Number((item as any).priceXL);
          
          // 2. جمع أسعار الإضافات المختارة مع الباقة (مثل الشوكولاتة والفازة)
          const addonsTotal = item.selectedAddons?.reduce((sum, addon) => sum + Number(addon.price), 0) || 0;
          
          // 3. السعر الكلي للعنصر هو (سعر المقاس + أسعار الإضافات) × الكمية
          return total + (price + addonsTotal) * item.quantity;
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