// AddProduct.tsx
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

  // تحديث الحالة لتشمل حقول الأسعار الأربعة الإضافية للمقاسات
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    priceS: "0.00",
    priceM: "0.00",
    priceL: "0.00",
    priceXL: "0.00",
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
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-background to-muted/30 font-['Cairo'] text-right" dir="rtl">
      <div className="max-w-3xl mx-auto px-4">
        {/* زر العودة */}
        <button 
          onClick={() => setLocation("/admin")} 
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 font-bold transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة للوحة التحكم</span>
        </button>

        {/* كرت النموذج */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-border/50 p-6 sm:p-10 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8 border-b pb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <PackagePlus size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">إضافة منتج جديد للمتجر</h1>
              <p className="text-sm text-muted-foreground mt-0.5">أدخل تفاصيل الوردة، الأسعار المخصصة لكل حجم، والصور</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* اسم المنتج */}
            <div className="relative">
              <Tag className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <input
                required
                type="text"
                placeholder="اسم المنتج (مثال: باقة جوري أحمر)..."
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* التصنيف */}
            <div className="relative">
              <Tag className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <select
                required
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="باقات">باقات ورود</option>
                <option value="فازات">فازات زجاجية</option>
                <option value="صناعي">ورد صناعي</option>
                <option value="هدايا">هدايا وشوكولاتة</option>
              </select>
            </div>

            {/* السعر الافتراضي العام */}
            <div className="relative">
              <DollarSign className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <input
                required
                type="number"
                step="0.01"
                placeholder="السعر الافتراضي العام (د.أ)..."
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            {/* حقل سعر المقاس الصغير S */}
            <div className="relative">
              <DollarSign className="absolute right-4 top-3.5 text-primary" size={20} />
              <input
                type="number"
                step="0.01"
                placeholder="سعر الحجم الصغير (S) - اختياري..."
                className="w-full pr-12 pl-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, priceS: e.target.value || "0.00" })}
              />
            </div>

            {/* حقل سعر المقاس الوسط M */}
            <div className="relative">
              <DollarSign className="absolute right-4 top-3.5 text-primary" size={20} />
              <input
                type="number"
                step="0.01"
                placeholder="سعر الحجم الوسط (M) - اختياري..."
                className="w-full pr-12 pl-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, priceM: e.target.value || "0.00" })}
              />
            </div>

            {/* حقل سعر المقاس الكبير L */}
            <div className="relative">
              <DollarSign className="absolute right-4 top-3.5 text-primary" size={20} />
              <input
                type="number"
                step="0.01"
                placeholder="سعر الحجم الكبير (L) - اختياري..."
                className="w-full pr-12 pl-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, priceL: e.target.value || "0.00" })}
              />
            </div>

            {/* حقل سعر المقاس الكبير جداً XL */}
            <div className="relative md:col-span-1">
              <DollarSign className="absolute right-4 top-3.5 text-primary" size={20} />
              <input
                type="number"
                step="0.01"
                placeholder="سعر الحجم الكبير جداً (XL) - اختياري..."
                className="w-full pr-12 pl-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, priceXL: e.target.value || "0.00" })}
              />
            </div>

            {/* رابط الصورة */}
            <div className="relative md:col-span-1">
              <ImageIcon className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <input
                required
                type="url"
                placeholder="رابط صورة المنتج الحقيقي (URL)..."
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
                placeholder="اكتب وصفاً جذاباً وتفاصيل عن نوع الورد والتنسيق..."
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* أزرار التحكم وحفظ البيانات */}
            <div className="md:col-span-2 flex gap-4 pt-2">
              <Button
                disabled={loading}
                type="submit"
                className="flex-1 py-6 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary/95 transition-all text-base"
              >
                {loading ? "جاري حفظ ونشر المنتج..." : "نشر المنتج في المتجر الآن"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin")}
                className="py-6 rounded-2xl text-base px-6 hover:bg-slate-50"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}