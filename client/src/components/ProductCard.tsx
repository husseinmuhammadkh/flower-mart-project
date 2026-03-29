import { Link } from "wouter";
import { useCart } from "@/store/use-cart"; // تأكد من هذا المسار
import { Plus, Check } from "lucide-react"; 
import type { Product } from "@shared/schema";
import { motion } from "framer-motion";
import { useState } from "react";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(product); // استخدام الدالة من ملفك
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-border/50 transition-all duration-300 flex flex-col"
    >
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden cursor-pointer">
        <div className="absolute inset-0 bg-black/5 z-10" />
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform" />
      </Link>

      <div className="p-5 flex flex-col flex-1 text-right">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xl font-bold text-foreground mb-1 hover:text-primary transition-colors cursor-pointer">{product.name}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between flex-row-reverse">
          <span className="text-lg font-bold text-primary">{Number(product.price).toFixed(2)} ر.س</span>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || added}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all z-30 ${added ? "bg-green-500 text-white" : "bg-primary text-white"}`}
          >
            {added ? <Check size={24} /> : <Plus size={24} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}