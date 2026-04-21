import { useCart } from "@/store/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutRequest } from "@shared/schema";
import { ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2, Trash2, Plus, Minus, Trash } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Checkout() {
  const { items, updateQuantity, removeItem, clearCart, getCartTotal } = useCart();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();

  const totalAmount = getCartTotal();

  const form = useForm<CheckoutRequest>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      items: items.map(i => ({ productId: Number(i.id), quantity: Number(i.quantity) }))
    }
  });

  // إعادة التوجيه للرئيسية إذا كانت السلة فارغة
  useEffect(() => {
    if (items.length === 0 && !createOrder.isSuccess) {
      setLocation("/");
    }
  }, [items.length, setLocation, createOrder.isSuccess]);

  const onSubmit = async (data: CheckoutRequest) => {
    try {
      const finalOrderData = {
        customerName: data.customerName.trim(),
        customerEmail: data.customerEmail.trim(),
        customerPhone: data.customerPhone.trim(),
        customerAddress: data.customerAddress.trim(),
        items: items.map(item => ({
          productId: Number(item.id),
          quantity: Number(item.quantity)
        }))
      };

      const order = await createOrder.mutateAsync(finalOrderData);
      
      if (order && order.id) {

        // حفظ بيانات العميل للطلبات القادمة (Guest Checkout)
        localStorage.setItem("guestCustomer", JSON.stringify({
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress
        }));

        clearCart();
        setLocation(`/order/${order.id}`);
      }

    } catch (error) {
      console.error("فشل إتمام الطلب:", error);
    }
  };

  if (items.length === 0 && !createOrder.isSuccess) return null;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-muted/30 font-['Cairo'] text-right" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group cursor-pointer font-bold">
              <ArrowRight size={20} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
              <span>العودة للتسوق</span>
            </div>
          </Link>
          
          <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:bg-red-50 gap-2 font-bold">
             <Trash size={18} />
             <span>حذف الكل</span>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="w-full lg:w-2/3 order-2 lg:order-1">
            <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-border/50">
              
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/50">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">بيانات التوصيل</h2>
                  <p className="text-sm text-muted-foreground">
                    يمكنك الطلب بدون تسجيل دخول
                  </p>
                </div>
              </div>

              <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold mr-1">الاسم الكامل</label>
                    <input {...form.register("customerName")} 
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all" 
                    placeholder="أحمد محمد" />
                    
                    {form.formState.errors.customerName && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.customerName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
  <label className="block text-sm font-bold mr-1">
    رقم الهاتف
  </label>

  <input
    maxLength={10}
    {...form.register("customerPhone", {
      required: "رقم الهاتف مطلوب",
      pattern: {
        value: /^[0-9]{10}$/,
        message: "رقم الهاتف يجب أن يكون 10 أرقام بالضبط"
      }
    })}
    dir="ltr"
    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-right"
    placeholder="05XXXXXXXX"
  />

  {form.formState.errors.customerPhone && (
    <p className="text-red-500 text-xs mt-1">
      {form.formState.errors.customerPhone.message}
    </p>
  )}
</div>

                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold mr-1">
                    البريد الإلكتروني
                  </label>

                  <input {...form.register("customerEmail")} 
                  dir="ltr"
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-right" 
                  placeholder="mail@example.com" />

                  {form.formState.errors.customerEmail && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.customerEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold mr-1">
                    عنوان التوصيل الكامل
                  </label>

                  <textarea {...form.register("customerAddress")} 
                  rows={3}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all resize-none" 
                  placeholder="المدينة، الحي، الشارع..." />

                  {form.formState.errors.customerAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.customerAddress.message}
                    </p>
                  )}
                </div>

              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-1/3 order-1 lg:order-2">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-border/50 sticky top-28">

              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                ملخص الطلب
              </h2>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">

                {items.map((item) => (

                  <div key={item.id}
                  className="flex flex-col gap-3 p-3 border border-border/50 rounded-2xl bg-slate-50/50">

                    <div className="flex gap-4 items-center">

                      <img src={item.imageUrl} 
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover" />

                      <div className="flex-1">
                        <h4 className="font-bold text-sm truncate w-32">
                          {item.name}
                        </h4>

                        <p className="text-primary font-bold text-xs">
                          {Number(item.price).toFixed(2)} ر.س
                        </p>
                      </div>

                      <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600">

                        <Trash2 size={18} />

                      </button>

                    </div>

                  </div>

                ))}

              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-black text-xl">
                  <span>الإجمالي</span>
                  <span className="text-primary">
                    {totalAmount.toFixed(2)} ر.س
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={createOrder.isPending}
                className="w-full py-5 rounded-2xl font-bold bg-primary text-white"
              >
                {createOrder.isPending ? "جاري المعالجة..." : "تأكيد الطلب"}
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}