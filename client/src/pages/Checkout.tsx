import { useCart } from "@/store/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutRequest } from "@shared/schema";
import { ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2, Trash2, Plus, Minus, User, Phone, MapPin, Receipt, Gift, Truck, Calendar, Clock } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Checkout() {
  const { items, updateQuantity, removeItem, clearCart, getCartTotal } = useCart();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();

  const cartSubtotal = getCartTotal();

  const form = useForm<CheckoutRequest>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      isGift: false,
      recipientName: "",
      recipientPhone: "",
      deliveryDate: "",
      deliveryTime: "",
      deliveryType: "normal",
      deliveryCost: "0.00",
      items: items.map(i => ({ 
        productId: Number(i.id), 
        quantity: Number(i.quantity),
        selectedSize: i.selectedSize || "medium",
        customNotes: i.customNotes || "",
        selectedAddons: JSON.stringify(i.selectedAddons || [])
      }))
    }
  });

  const isGiftChecked = form.watch("isGift");
  const currentDeliveryType = form.watch("deliveryType");

  // تحديث تكلفة الشحن والإجمالي الكلي تلقائياً
  const deliveryFee = currentDeliveryType === "express" ? 2.00 : 0.00;
  const finalTotalAmount = cartSubtotal + deliveryFee;

  useEffect(() => {
    form.setValue("deliveryCost", deliveryFee.toFixed(2));
  }, [deliveryFee, form]);

  useEffect(() => {
    if (items.length === 0 && !createOrder.isSuccess) {
      setLocation("/");
    }
  }, [items.length, setLocation, createOrder.isSuccess]);

  const onSubmit = async (data: CheckoutRequest) => {
    try {
      const finalOrderData = {
        ...data,
        deliveryCost: deliveryFee.toFixed(2),
        items: items.map(i => ({
          productId: Number(i.id),
          quantity: Number(i.quantity),
          selectedSize: i.selectedSize || "medium",
          customNotes: i.customNotes || "",
          selectedAddons: JSON.stringify(i.selectedAddons || [])
        }))
      };
      
      await createOrder.mutateAsync(finalOrderData);
      clearCart();
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  if (createOrder.isSuccess && createOrder.data) {
    const orderData = createOrder.data;

    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center font-['Cairo'] px-4 text-center" dir="rtl">
        <div className="max-w-xl w-full bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl text-right">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} />
          </div>
          <h2 className="text-3xl font-black mb-2 text-center text-slate-900">تم استلام طلبك بنجاح!</h2>
          <p className="text-muted-foreground mb-6 text-center leading-relaxed text-sm sm:text-base">
            شكراً لك! تم تسجيل طلبك وجاري العمل على تجهيزه بكل حب ونقاء.
          </p>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 mb-8 text-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="font-black text-lg flex items-center gap-1.5 text-primary">
                <Receipt size={18} /> تفاصيل الطلب
              </span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-sm">
                رقم الطلب: #{orderData.id}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400 shrink-0" />
                <span className="text-slate-500">اسم العميل:</span>
                <span className="font-bold">{orderData.customerName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400 shrink-0" />
                <span className="text-slate-500">رقم الهاتف:</span>
                <span className="font-bold" dir="ltr">{orderData.customerPhone}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <span className="text-slate-500">عنوان التوصيل:</span>
                <span className="font-bold">{orderData.customerAddress}</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck size={16} className="text-slate-400 shrink-0" />
                <span className="text-slate-500">نوع الشحن:</span>
                <span className="font-bold">{orderData.deliveryType === "express" ? "شحن سريع خلال ساعات (+2 د.أ)" : "توصيل عادي"}</span>
              </div>

              {orderData.isGift && (
                <div className="bg-pink-50/60 p-3 rounded-xl border border-pink-100/50 space-y-1.5">
                  <p className="font-bold text-xs text-pink-700 flex items-center gap-1"><Gift size={14}/> الطلب مرسل كهدية</p>
                  <p className="text-xs"><b>اسم المستلم:</b> {orderData.recipientName}</p>
                  <p className="text-xs"><b>هاتف المستلم:</b> {orderData.recipientPhone}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 font-black text-base sm:text-lg text-slate-900">
                <span>المبلغ الإجمالي المُراد دفعه:</span>
                <span className="text-primary">{Number(orderData.total).toFixed(2)} د.أ</span>
              </div>
            </div>
            <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-lg text-center font-semibold">
              ⚠️ يتم الدفع نقداً (كاش) عند استلام الطلب من المندوب.
            </p>
          </div>

          <Link href="/" className="block w-full text-center py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform">
            العودة للرئيسية والتسوق
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-['Cairo'] text-right" dir="rtl">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 font-bold">
        <ArrowRight size={20} className="ml-1" />
        <span>العودة للتسوق</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
              <ShieldCheck className="text-primary" size={28} /> تفاصيل الشحن والدفع
            </h1>
            <p className="text-muted-foreground text-sm">يرجى ملء البيانات التالية بدقة لضمان وصول طلبك في أسرع وقت. الدفع نقداً عند الاستلام.</p>
          </div>

          <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-bold text-slate-700 text-sm">الاسم الكامل</label>
                <input {...form.register("customerName")} placeholder="أدخل اسمك الثلاثي" className="w-full p-4 rounded-xl border border-slate-200 text-sm shadow-sm" />
                {form.formState.errors.customerName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.customerName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 text-sm">رقم الهاتف (الخلوي)</label>
                <input {...form.register("customerPhone")} placeholder="مثال: 0791234567" className="w-full p-4 rounded-xl border border-slate-200 text-sm shadow-sm text-left" dir="ltr" />
                {form.formState.errors.customerPhone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.customerPhone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 text-sm">البريد الإلكتروني</label>
              <input {...form.register("customerEmail")} placeholder="name@example.com" className="w-full p-4 rounded-xl border border-slate-200 text-sm shadow-sm text-left" dir="ltr" />
              {form.formState.errors.customerEmail && <p className="text-red-500 text-xs mt-1">{form.formState.errors.customerEmail.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 text-sm">العنوان بالتفصيل</label>
              <textarea {...form.register("customerAddress")} placeholder="المحافظة، المدينة، الشارع، البناية..." className="w-full p-4 rounded-xl border border-slate-200 text-sm shadow-sm min-h-[80px] resize-none" />
              {form.formState.errors.customerAddress && <p className="text-red-500 text-xs mt-1">{form.formState.errors.customerAddress.message}</p>}
            </div>

            {/* نظام اختيار باقات التوصيل (العادي والسرع) */}
            <div className="space-y-3 pt-2">
              <label className="font-bold text-slate-700 text-sm flex items-center gap-1"><Truck size={16} className="text-primary"/> خيارات التوصيل المتوفرة:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => form.setValue("deliveryType", "normal")} className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between ${currentDeliveryType === "normal" ? "border-primary bg-primary/5 text-primary font-bold shadow-sm" : "border-slate-200 bg-white"}`}>
                  <span className="text-sm">توصيل عادي</span>
                  <span className="text-xs text-muted-foreground mt-1 font-normal">خلال اليوم التالي - مجاني</span>
                </button>
                <button type="button" onClick={() => form.setValue("deliveryType", "express")} className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between ${currentDeliveryType === "express" ? "border-emerald-500 bg-emerald-50/40 text-emerald-900 font-bold shadow-sm" : "border-slate-200 bg-white"}`}>
                  <span className="text-sm flex items-center gap-1">توصيل فوري وسريع ⚡</span>
                  <span className="text-xs text-emerald-600 mt-1 font-semibold">توصيل خلال ساعات بسيطة (+2.00 د.أ)</span>
                </button>
              </div>
            </div>

            {/* منتقي مواعيد التوصيل */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="font-bold text-slate-700 text-xs flex items-center gap-1"><Calendar size={14}/> تحديد تاريخ التوصيل:</label>
                <input type="date" {...form.register("deliveryDate")} className="w-full p-3.5 rounded-xl border border-slate-200 text-sm shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-slate-700 text-xs flex items-center gap-1"><Clock size={14}/> الوقت المفضل للتسليم:</label>
                <select {...form.register("deliveryTime")} className="w-full p-3.5 rounded-xl border border-slate-200 text-sm shadow-sm bg-white">
                  <option value="">أي وقت مناسب</option>
                  <option value="morning">صباحاً (9:00 ص - 12:00 م)</option>
                  <option value="afternoon">ظهراً (12:00 م - 4:00 م)</option>
                  <option value="evening">مساءً (4:00 م - 9:00 م)</option>
                </select>
              </div>
            </div>

            {/* نظام إرسال كهدية */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 bg-pink-50/40 border border-pink-100/60 p-4 rounded-xl cursor-pointer hover:bg-pink-50/70 transition-colors">
                <input type="checkbox" checked={isGiftChecked} onChange={(e) => form.setValue("isGift", e.target.checked)} className="w-5 h-5 rounded accent-primary cursor-pointer" />
                <div className="text-right">
                  <span className="font-bold text-pink-900 text-sm flex items-center gap-1"><Gift size={16}/> هل تود إرسال هذا الطلب كهدية لشخص آخر؟</span>
                  <p className="text-xs text-pink-700/80 mt-0.5">عند تفعيل الخيار، لن نقوم بطباعة أو إرفاق الأسعار على الفاتورة الواصلة للباقة.</p>
                </div>
              </label>

              {isGiftChecked && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-slate-50/60 p-4 rounded-xl border border-dashed border-slate-200 animate-in fade-in-50 duration-200">
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 text-xs">اسم الشخص المستلم</label>
                    <input {...form.register("recipientName")} placeholder="أدخل اسم مستلم الهدية" className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 text-xs">رقم هاتف المستلم (للتنسيق معه)</label>
                    <input {...form.register("recipientPhone")} placeholder="مثال: 079xxxxxxx" className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white text-left" dir="ltr" />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h3 className="font-black text-xl mb-6 pb-3 border-b flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary" /> ملخص الطلب
            </h3>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 mb-6">
              {items.map((item, idx) => {
                // حساب وحساب الأسعار شاملة الإضافات المرافقة للوردة
                const sizePrice = Number(item.price);
                const addonsPriceSum = item.selectedAddons?.reduce((s, a) => s + Number(a.price), 0) || 0;
                const unitPriceTotal = sizePrice + addonsPriceSum;

                return (
                  <div key={`${item.id}-${item.selectedSize}-${idx}`} className="flex gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm relative group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm truncate text-slate-800">{item.name}</h4>
                        <p className="text-primary font-medium text-[11px] mt-0.5">
                          الحجم: {
                            item.selectedSize === "small" ? "صغير (S)" :
                            item.selectedSize === "medium" ? "وسط (M)" :
                            item.selectedSize === "large" ? "كبير (L)" : "كبير جداً (XL)"
                          }
                        </p>

                        {/* طباعة الهدايا المرافقة للباقة إن وجدت */}
                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.selectedAddons.map((add, aIdx) => (
                              <span key={aIdx} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-semibold">
                                + {add.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.customNotes && (
                          <p className="text-[10px] text-slate-500 bg-slate-50 p-1 px-2 rounded mt-1 truncate">
                            <span className="font-bold">ملاحظة:</span> {item.customNotes}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-md px-2 py-0.5">
                          <button type="button" onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} className="text-slate-500 hover:text-primary"><Minus size={12} /></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} className="text-slate-500 hover:text-primary"><Plus size={12} /></button>
                        </div>
                        <span className="text-slate-900 font-bold text-xs">{(unitPriceTotal * item.quantity).toFixed(2)} د.أ</span>
                      </div>
                    </div>

                    <button type="button" onClick={() => removeItem(item.id, item.selectedSize)} className="text-slate-300 hover:text-red-500 absolute top-2 left-2 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* تفاصيل الحساب الكلية تشمل المنتجات والشحن الفوري */}
            <div className="border-t pt-4 space-y-2 mb-6 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>مجموع المنتجات:</span>
                <span className="font-bold">{cartSubtotal.toFixed(2)} د.أ</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>تكلفة التوصيل:</span>
                <span className="font-bold">{deliveryFee > 0 ? `${deliveryFee.toFixed(2)} د.أ` : "مجاني"}</span>
              </div>
              <div className="flex justify-between font-black text-xl pt-2 border-t">
                <span>الإجمالي النهائي:</span>
                <span className="text-primary">{finalTotalAmount.toFixed(2)} د.أ</span>
              </div>
            </div>

            <button type="submit" form="checkout-form" disabled={createOrder.isPending} className="w-full py-5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all text-lg flex items-center justify-center">
              {createOrder.isPending ? "جاري معالجة طلبك..." : "تأكيد وإرسال الطلب"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}