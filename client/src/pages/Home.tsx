import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: products, isLoading } = useProducts();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* hero background beautiful soft pastel roses */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2000&auto=format&fit=crop"
            alt="خلفية ورود"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/40 text-primary font-medium mb-6">
              <Leaf size={16} />
              <span>ورود طبيعية 100%</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              نصنع لحظات <br />
              <span className="text-primary font-serif italic">لا تُنسى</span> بالورود
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
              اكتشف مجموعتنا الحصرية من الباقات المنسقة بعناية للتعبير عن مشاعرك في كل مناسبة. جمال الطبيعة بين يديك.
            </p>
            <a 
              href="#products"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <span>تسوق الآن</span>
              <ArrowLeft size={20} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-foreground mb-4"
          >
            أحدث الباقات
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            تشكيلة مختارة من أجمل الزهور الطازجة، منسقة بشغف وحب لتناسب ذوقك الرفيع.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-card rounded-3xl overflow-hidden shadow-sm border border-border/50">
                <div className="aspect-[4/5] bg-muted" />
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-4/5" />
                  <div className="flex justify-between pt-4">
                    <div className="h-8 bg-muted rounded w-1/3" />
                    <div className="h-10 w-10 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border/50 text-muted-foreground">
            <Flower2 size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl">لا توجد منتجات متاحة حالياً.</p>
          </div>
        )}
      </section>
    </div>
  );
}
