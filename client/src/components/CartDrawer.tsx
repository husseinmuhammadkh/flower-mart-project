import { useCart } from "@/store/use-cart";
import { X, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartTotal } = useCart();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setIsOpen(false);
    setLocation("/checkout");
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
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-white/50">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <ShoppingBag size={20} />
                </div>
                <h2 className="text-xl font-bold text-foreground">سلة المشتريات</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ShoppingBag size={40} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium">سلتك فارغة</p>
                  <p className="text-sm">لم تقم بإضافة أي ورود إلى سلتك بعد.</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="mt-4 px-6 py-2 rounded-full border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-all"
                  >
                    تصفح الورود
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.id} 
                    className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-border/30"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="text-primary font-bold">{Number(item.price).toFixed(2)} ر.س</div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center bg-muted/50 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-foreground"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
              <div className="border-t border-border/50 p-6 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground font-medium">المجموع الإجمالي</span>
                  <span className="text-2xl font-bold text-foreground">
                    {getCartTotal().toFixed(2)} ر.س
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
