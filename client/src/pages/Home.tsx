import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf, Search, Flower2 } from "lucide-react";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");

  const categories = ["الكل", "باقات", "هدايا", "نباتات"];

  // منطق الفلترة والبحث
  const filteredProducts = products?.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "الكل" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-20 font-['Cairo'] text-right" dir="rtl">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2000&auto=format&fit=crop"
            alt="خلفية ورود"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start text-right">
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
            
            {/* شريط البحث المدمج في الهيرو */}
            <div className="relative max-w-md mb-10 group">
              <Search className="absolute right-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="ابحث عن باقة أو هدية..."
                className="w-full pr-12 pl-4 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-none shadow-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <a 
              href="#products"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <span>تسوق الآن</span>
              <ArrowLeft size={20} className="rotate-0" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="text-right">
            <motion.h2 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-foreground mb-4"
            >
              أحدث الباقات
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground max-w-xl"
            >
              تشكيلة مختارة من أجمل الزهور الطازجة، منسقة بشغف وحب لتناسب ذوقك الرفيع.
            </motion.p>
          </div>

          {/* أزرار التصنيفات */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 rounded-xl transition-all font-bold border ${
                  category === cat 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-card rounded-3xl overflow-hidden shadow-sm border border-border/50">
                <div className="aspect-[4/5] bg-muted" />
                <div className="p-5 space-y-4 text-right">
                  <div className="h-6 bg-muted rounded w-2/3 mr-0 ml-auto" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="flex justify-between pt-4">
                    <div className="h-8 bg-muted rounded w-1/3" />
                    <div className="h-10 w-10 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-[3rem] border border-dashed border-border text-muted-foreground">
            <Flower2 size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl">عذراً، لم نجد نتائج تطابق بحثك.</p>
            <button onClick={() => {setSearch(""); setCategory("الكل")}} className="mt-4 text-primary underline font-bold">عرض كل المنتجات</button>
          </div>
        )}
      </section>
    </div>
  );
}