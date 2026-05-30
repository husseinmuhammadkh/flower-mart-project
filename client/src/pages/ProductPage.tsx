import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Product, type Review } from "@shared/schema";
import { useCart, type CartAddon } from "@/store/use-cart";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { 
  Minus, Plus, ShoppingBag, ArrowRight, Loader2, Star, MessageSquare, User, Gift
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// تعريف قائمة الإضافات المتاحة للشراء في المتجر بأسعارها الثابتة
const AVAILABLE_ADDONS: Omit<CartAddon, 'id'>[] = [
  { name: "شوكولاتة فاخرة 🍫", price: 5.00 },
  { name: "فازة زجاجية راقية 🍶", price: 4.00 },
  { name: "بالون هيليوم مناسبات 🎈", price: 3.00 }
];

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [userRating, setUserRating] = useState(5);
  const [comment, setComment] = useState("");
  
  // الحقول الجديدة للأحجام والملاحظات والإضافات المختارة
  const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "large" | "xlarge">("medium");
  const [customNotes, setCustomNotes] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<CartAddon[]>([]);

  const productId = id ? Number(id) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // جلب بيانات المنتج
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error("المنتج غير موجود");
      return res.json();
    },
    enabled: !!productId,
  });

  // جلب التقييمات
  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!productId,
  });

  const addReviewMutation = useMutation({
    mutationFn: async (newReview: any) => {
      const res = await apiRequest("POST", "/api/reviews", newReview);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      setComment("");
      setUserRating(5);
      toast({ title: "تم بنجاح", description: "تم نشر تقييمك بنجاح!" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء إرسال التقييم", variant: "destructive" });
    }
  });

  const handleAddReview = () => {
    if (!currentUser) {
      toast({ title: "تنبيه", description: "يجب تسجيل الدخول أولاً للتقييم", variant: "destructive" });
      return;
    }
    addReviewMutation.mutate({
      productId: productId,
      username: currentUser.username,
      rating: userRating,
      comment: comment
    });
  };

  // ميثود للتحكم في اختيار الإضافات وإلغائها
  const toggleAddon = (addonName: string, addonPrice: number) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.name === addonName);
      if (exists) {
        return prev.filter(a => a.name !== addonName);
      } else {
        const newAddon: CartAddon = {
          id: `addon-${addonName}-${Date.now()}`,
          name: addonName,
          price: addonPrice
        };
        return [...prev, newAddon];
      }
    });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  
  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 font-['Cairo']" dir="rtl">
      <h2 className="text-2xl font-bold mb-2">المنتج غير موجود</h2>
      <p className="text-muted-foreground mb-4">ربما تم حذف المنتج أو أن الرابط غير صحيح.</p>
      <Link href="/" className="px-8 py-3 bg-primary text-white rounded-2xl font-bold mt-4">العودة للمتجر</Link>
    </div>
  );

  // حساب السعر الحالي بناءً على الحجم المختار
  let displayPrice = Number(product.price);
  if (selectedSize === "small" && (product as any).priceS && Number((product as any).priceS) > 0) displayPrice = Number((product as any).priceS);
  if (selectedSize === "medium" && (product as any).priceM && Number((product as any).priceM) > 0) displayPrice = Number((product as any).priceM);
  if (selectedSize === "large" && (product as any).priceL && Number((product as any).priceL) > 0) displayPrice = Number((product as any).priceL);
  if (selectedSize === "xlarge" && (product as any).priceXL && Number((product as any).priceXL) > 0) displayPrice = Number((product as any).priceXL);

  // إضافة مجموع أسعار الإضافات المختارة مع باقة الورد
  const addonsTotalPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);

  // الحساب الإجمالي المطور ( (سعر المقاس + مجموع الإضافات) × الكمية المطلوبة )
  const totalPrice = (displayPrice + addonsTotalPrice) * quantity;

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-['Cairo'] text-right" dir="rtl">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 font-bold">
        <ArrowRight size={20} className="ml-1" />
        <span>العودة للتسوق</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl bg-muted">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-4">{product.name}</h1>
          <div className="text-3xl font-bold text-primary mb-6 border-b pb-4">
            {displayPrice.toFixed(2)} <span className="text-lg">د.أ</span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">{product.description}</p>

          <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8">
            
            {/* قسم اختيار الحجم المتوفر */}
            <div className="space-y-3">
              <span className="text-foreground font-bold block">اختر الحجم المناسب:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* حجم صغير */}
                {Number((product as any).priceS) > 0 && (
                  <button
                    type="button"
                    onClick={() => { setSelectedSize("small"); }}
                    className={`p-3 rounded-xl border text-center font-bold transition-all text-sm ${selectedSize === "small" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    صغير (S)
                    <div className="text-xs font-normal mt-1">{Number((product as any).priceS).toFixed(2)} د.أ</div>
                  </button>
                )}

                {/* حجم وسط */}
                {Number((product as any).priceM) > 0 && (
                  <button
                    type="button"
                    onClick={() => { setSelectedSize("medium"); }}
                    className={`p-3 rounded-xl border text-center font-bold transition-all text-sm ${selectedSize === "medium" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    وسط (M)
                    <div className="text-xs font-normal mt-1">{Number((product as any).priceM).toFixed(2)} د.أ</div>
                  </button>
                )}

                {/* حجم كبير */}
                {Number((product as any).priceL) > 0 && (
                  <button
                    type="button"
                    onClick={() => { setSelectedSize("large"); }}
                    className={`p-3 rounded-xl border text-center font-bold transition-all text-sm ${selectedSize === "large" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    كبير (L)
                    <div className="text-xs font-normal mt-1">{Number((product as any).priceL).toFixed(2)} د.أ</div>
                  </button>
                )}

                {/* حجم كبير جداً */}
                {Number((product as any).priceXL) > 0 && (
                  <button
                    type="button"
                    onClick={() => { setSelectedSize("xlarge"); }}
                    className={`p-3 rounded-xl border text-center font-bold transition-all text-sm ${selectedSize === "xlarge" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    كبير جداً (XL)
                    <div className="text-xs font-normal mt-1">{Number((product as any).priceXL).toFixed(2)} د.أ</div>
                  </button>
                )}
              </div>
            </div>

            {/* قسم الإضافات المقترحة مع الورد لزيادة المبيعات والطلب كهدية */}
            <div className="space-y-3 pt-2">
              <span className="text-foreground font-bold flex items-center gap-2">
                <Gift size={18} className="text-primary" /> أضف هدايا مكملة مع طلبك (اختياري):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {AVAILABLE_ADDONS.map((addon) => {
                  const isChecked = selectedAddons.some(a => a.name === addon.name);
                  return (
                    <button
                      key={addon.name}
                      type="button"
                      onClick={() => toggleAddon(addon.name, addon.price)}
                      className={`p-3 rounded-xl border text-right transition-all text-xs flex flex-col justify-between ${isChecked ? "border-emerald-500 bg-emerald-50/40 text-emerald-900 font-bold shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span>{addon.name}</span>
                      <span className={`text-xs mt-1 block font-semibold ${isChecked ? "text-emerald-600" : "text-slate-400"}`}>
                        +{addon.price.toFixed(2)} د.أ
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* حقل إضافة ملاحظات وتعديلات للطلب */}
            <div className="space-y-2">
              <label className="text-foreground font-bold block">ملاحظاتك أو التعديلات المطلوبة (اختياري):</label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="مثال: كتابة كرت إهداء، تغليف بلون معين..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm"
              />
            </div>

            {/* التحكم بالكمية وحساب الإجمالي الفعلي المباشر */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-200/60 mt-4">
              <div className="flex items-center gap-4">
                <span className="text-foreground font-bold">الكمية:</span>
                <div className="flex items-center bg-white rounded-xl p-1 border shadow-sm">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors"><Minus size={18} /></button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors"><Plus size={18} /></button>
                </div>
              </div>

              {/* طباعة المجموع الحسابي الحقيقي والواضح بناءً على المدخلات شامل الإضافات */}
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">الإجمالي الحالي:</span>
                <span className="text-2xl font-black text-primary">{totalPrice.toFixed(2)} د.أ</span>
              </div>
            </div>

            <Button 
              onClick={() => {
                addItem({
                  ...product,
                  price: displayPrice.toString(), // السعر المعتمد للمقاس المختار داخل السلة
                  selectedSize: selectedSize,
                  customNotes: customNotes,
                  selectedAddons: selectedAddons // إرسال الإضافات المرافقة للورد كاملة للسلة
                } as any, quantity);
                
                toast({
                  title: "تمت الإضافة",
                  description: `تم إضافة ${product.name} (عدد ${quantity}) مع إضافاتك المختارة إلى السلة بنجاح.`
                });
                
                // إعادة تصفير الإضافات والملاحظات بعد التخزين الناجح
                setCustomNotes("");
                setSelectedAddons([]);
                setQuantity(1);
              }}
              disabled={!product.inStock}
              className="w-full py-8 rounded-2xl font-bold text-xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all gap-3"
            >
              <ShoppingBag size={24} />
              {product.inStock ? 'إضافة إلى السلة' : 'نفذت الكمية'}
            </Button>
          </div>
        </motion.div>
      </div>

      <hr className="mb-16 border-slate-100" />

      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black mb-10 flex items-center gap-3">
          <Star className="text-primary fill-primary" /> تقييمات العملاء
        </h2>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm mb-12">
          <h3 className="font-bold text-xl mb-6">شاركنا رأيك</h3>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                size={30}
                className={`cursor-pointer transition-all hover:scale-110 ${star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
                onClick={() => setUserRating(star)}
              />
            ))}
          </div>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="اكتب تعليقك هنا..."
            className="w-full min-h-[120px] p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary mb-4 resize-none"
          />
          <Button 
            onClick={handleAddReview}
            disabled={addReviewMutation.isPending || !comment.trim()}
            className="rounded-xl px-10 py-6 font-bold"
          >
            {addReviewMutation.isPending ? "جاري النشر..." : "نشر التقييم"}
          </Button>
        </div>

        <div className="space-y-6">
          {reviews?.map((review) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              key={review.id} 
              className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <User size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold">{review.username}</h4>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"} />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                <span className="text-[10px] text-slate-400 mt-3 block">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ar-EG') : ''}
                </span>
              </div>
            </motion.div>
          ))}
          
          {(!reviews || reviews.length === 0) && (
            <div className="text-center py-16 text-muted-foreground bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg">لا توجد تقييمات لهذا المنتج بعد.</p>
              <p className="text-sm">كن أول من يشاركنا رأيه!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}