import { useCart } from "@/store/use-cart";
import { X, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartTotal } = useCart();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setIsOpen(false);
    setLocation(\"/checkout\");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer - Note: right-0 for RTL to slide from the right side */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background shadow-2xl z-50 flex flex-col border-l border-border/50"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-primary" size={24} />
                <h2 className="text-xl font-bold font-['Cairo']">سلة التسوق</h2>
                <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content / Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-['Cairo']">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground pb-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={30} className="opacity-40" />
                  </div>
                  <p className="text-lg font-medium mb-1">سلتك فارغة حالياً</p>
                  <p className="text-sm opacity-80 mb-6">ابدأ بإضافة بعض الورود الجميلة لتظهر هنا</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-primary font-bold hover:underline"
                  >
                    تصفح المتجر الآن
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    key={`${item.id}-${item.selectedSize}-${index}`}
                    className="flex gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-border transition-colors relative group"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-foreground text-sm sm:text-base truncate">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id, item.selectedSize)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors shrink-0 md:opacity-0 group-hover:opacity-100"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* عرض المقاس المختار باللغة العربية */}
                        <div className="text-xs text-primary font-medium mt-0.5">
                          الحجم: {
                            item.selectedSize === "small" ? "صغير (S)" :
                            item.selectedSize === "medium" ? "وسط (M)" :
                            item.selectedSize === "large" ? "كبير (L)" : "كبير جداً (XL)"
                          }
                        </div>

                        {/* عرض ملاحظات وإضافات العميل المكتوبة */}
                        {item.customNotes && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-1.5 px-2.5 rounded-lg mt-1 break-words leading-relaxed">
                            <span className="font-bold text-slate-600 ml-1">ملاحظتك:</span> 
                            {item.customNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-sm text-foreground">
                          {(Number(item.price) * item.quantity).toFixed(2)} د.أ
                        </span>

                        <div className="flex items-center bg-muted/60 rounded-lg p-0.5 border border-border/20">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-foreground"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-foreground"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border/50 p-6 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.03)] font-['Cairo']">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground font-medium">المجموع الإجمالي</span>
                  <span className="text-2xl font-bold text-foreground">
                    {getCartTotal().toFixed(2)} د.أ
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl font-bold text-lg
                    bg-gradient-to-l from-primary to-primary/80 text-white
                    shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5
                    active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>إتمام الطلب</span>
                  <ArrowLeft size={20} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}