import { Link } from "wouter";
import { useCart } from "@/store/use-cart";
import { Plus } from "lucide-react";
import type { Product } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-border/50 transition-all duration-300 flex flex-col"
    >
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden cursor-pointer">
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent z-10 transition-colors duration-300" />
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {!product.inStock && (
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur text-destructive px-3 py-1 text-sm font-bold rounded-full shadow-sm">
            نفذت الكمية
          </div>
        )}
        {product.category && (
          <div className="absolute bottom-4 right-4 z-20 bg-white/80 backdrop-blur text-foreground px-3 py-1 text-xs font-medium rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
            {product.category}
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link href={`/product/${product.id}`} className="cursor-pointer">
          <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {product.description}
          </p>
        </Link>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-foreground bg-primary/5 px-3 py-1 rounded-lg text-primary">
            {Number(product.price).toFixed(2)} ر.س
          </span>
          <button
            onClick={() => addItem(product)}
            disabled={!product.inStock}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-muted disabled:hover:text-foreground"
            aria-label="أضف إلى السلة"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
