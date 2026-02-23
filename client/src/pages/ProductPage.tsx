import { useParams } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/store/use-cart";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Truck, Clock } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(Number(id));
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 aspect-[4/5] bg-muted rounded-3xl" />
          <div className="w-full md:w-1/2 space-y-6 pt-8">
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-4/5" />
            </div>
            <div className="h-14 bg-muted rounded-xl w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">لم يتم العثور على المنتج</h2>
        <p className="text-muted-foreground mb-8">عذراً، المنتج الذي تبحث عنه غير موجود أو تم إزالته.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group cursor-pointer">
        <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
        <span>العودة للتسوق</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
        {/* Product Image */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-1/2"
        >
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5 bg-muted">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.category && (
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-foreground px-4 py-1.5 text-sm font-bold rounded-full shadow-sm">
                {product.category}
              </div>
            )}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full md:w-1/2 flex flex-col justify-center"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {product.name}
          </h1>
          <div className="text-3xl font-bold text-primary mb-8 flex items-baseline gap-2">
            {Number(product.price).toFixed(2)} <span className="text-lg font-medium text-muted-foreground">ر.س</span>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            {product.description}
          </p>

          <div className="space-y-8 bg-card border border-border/50 p-6 sm:p-8 rounded-3xl mb-8">
            <div className="flex items-center gap-6">
              <span className="text-foreground font-medium w-16">الكمية:</span>
              <div className="flex items-center bg-muted rounded-xl p-1.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm hover:text-primary transition-colors text-foreground"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm hover:text-primary transition-colors text-foreground"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full py-4 rounded-xl font-bold text-lg
                bg-gradient-to-r from-primary to-primary/80 text-white
                shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5
                active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <ShoppingBag size={22} />
              <span>{product.inStock ? 'إضافة إلى السلة' : 'نفذت الكمية'}</span>
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border/50">
            <div className="flex flex-col items-center text-center gap-2 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                <Truck size={24} />
              </div>
              <span className="text-sm font-medium">توصيل آمن</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <span className="text-sm font-medium">جودة مضمونة</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <Clock size={24} />
              </div>
              <span className="text-sm font-medium">دعم على مدار الساعة</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
