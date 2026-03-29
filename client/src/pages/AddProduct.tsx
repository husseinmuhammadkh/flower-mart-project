import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PackagePlus, Image as ImageIcon, Tag, DollarSign, AlignRight, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "باقات",
    inStock: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRequest("POST", "/api/products", formData);
      toast({ title: "تمت الإضافة", description: "المنتج متاح الآن في المتجر" });
      setLocation("/admin"); // العودة للوحة التحكم
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في إضافة المنتج" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-muted/30 font-['Cairo'] text-right" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full mx-4 bg-card rounded-[2.5rem] shadow-xl border border-border/50 overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <PackagePlus size={40} />
            </div>
            <h2 className="text-3xl font-black">إضافة منتج جديد</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* اسم المنتج */}
            <div className="md:col-span-2 relative">
              <Tag className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <input
                required
                placeholder="اسم المنتج (مثلاً: باقة جوري أحمر)"
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* السعر */}
            <div className="relative">
              <DollarSign className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <input
                required
                type="number"
                placeholder="السعر (ر.س)"
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            {/* القسم */}
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="باقات">باقات</option>
                <option value="هدايا">هدايا</option>
                <option value="نباتات">نباتات</option>
              </select>
            </div>

            {/* رابط الصورة */}
            <div className="md:col-span-2 relative">
              <ImageIcon className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <input
                required
                placeholder="رابط صورة المنتج (URL)"
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            {/* الوصف */}
            <div className="md:col-span-2 relative">
              <AlignRight className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <textarea
                required
                rows={3}
                placeholder="وصف المنتج..."
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <Button
                disabled={loading}
                type="submit"
                className="flex-1 py-6 bg-primary text-white font-bold rounded-2xl shadow-lg"
              >
                {loading ? "جاري الحفظ..." : "نشر المنتج الآن"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin")}
                className="py-6 rounded-2xl"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}