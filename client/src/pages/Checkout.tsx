import { useCart } from "@/store/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutRequest } from "@shared/schema";
import { ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Checkout() {
  const { items, getCartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();

  const form = useForm<CheckoutRequest>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerAddress: "",
      items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
    }
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !createOrder.isSuccess) {
      setLocation("/");
    }
  }, [items.length, setLocation, createOrder.isSuccess]);

  const onSubmit = async (data: CheckoutRequest) => {
    try {
      const order = await createOrder.mutateAsync(data);
      clearCart();
      setLocation(`/order/${order.id}`);
    } catch (error) {
      // Error is handled by mutation, we could show a local toast here if we had one imported
      console.error("Checkout failed:", error);
    }
  };

  if (items.length === 0 && !createOrder.isSuccess) return null;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group cursor-pointer">
          <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
          <span>العودة للتسوق</span>
        </Link>

        <div className="mb-10 text-center sm:text-start">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">إتمام الطلب</h1>
          <p className="text-muted-foreground">الرجاء إدخال بياناتك لإكمال عملية الشراء</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full lg:w-2/3"
          >
            <div className="bg-card rounded-[2rem] p-6 sm:p-10 shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/50">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">بيانات التوصيل</h2>
                  <p className="text-sm text-muted-foreground">معلوماتك مشفرة وآمنة</p>
                </div>
              </div>

              <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-foreground mb-2">الاسم الكامل</label>
                  <input
                    {...form.register("customerName")}
                    id="customerName"
                    className={`w-full px-5 py-4 rounded-xl bg-background border-2 
                      ${form.formState.errors.customerName ? 'border-destructive focus:ring-destructive/10' : 'border-border focus:border-primary focus:ring-primary/10'} 
                      text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 transition-all duration-200`}
                    placeholder="مثال: أحمد محمد"
                  />
                  {form.formState.errors.customerName && (
                    <p className="mt-2 text-sm text-destructive">{form.formState.errors.customerName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-medium text-foreground mb-2">البريد الإلكتروني</label>
                  <input
                    {...form.register("customerEmail")}
                    id="customerEmail"
                    type="email"
                    dir="ltr"
                    className={`w-full px-5 py-4 rounded-xl bg-background border-2 
                      ${form.formState.errors.customerEmail ? 'border-destructive focus:ring-destructive/10' : 'border-border focus:border-primary focus:ring-primary/10'} 
                      text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 transition-all duration-200 text-right`}
                    placeholder="ahmed@example.com"
                  />
                  {form.formState.errors.customerEmail && (
                    <p className="mt-2 text-sm text-destructive text-right">{form.formState.errors.customerEmail.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="customerAddress" className="block text-sm font-medium text-foreground mb-2">عنوان التوصيل التفصيلي</label>
                  <textarea
                    {...form.register("customerAddress")}
                    id="customerAddress"
                    rows={4}
                    className={`w-full px-5 py-4 rounded-xl bg-background border-2 
                      ${form.formState.errors.customerAddress ? 'border-destructive focus:ring-destructive/10' : 'border-border focus:border-primary focus:ring-primary/10'} 
                      text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 transition-all duration-200 resize-none`}
                    placeholder="المدينة، الحي، الشارع، رقم المبنى..."
                  />
                  {form.formState.errors.customerAddress && (
                    <p className="mt-2 text-sm text-destructive">{form.formState.errors.customerAddress.message}</p>
                  )}
                </div>
              </form>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-1/3"
          >
            <div className="bg-card rounded-[2rem] p-6 sm:p-8 shadow-sm border border-border/50 sticky top-28">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                ملخص الطلب
              </h2>

              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-primary text-sm">
                      {(Number(item.price) * item.quantity).toFixed(2)} ر.س
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-6 space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span>{getCartTotal().toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>رسوم التوصيل</span>
                  <span className="text-secondary font-medium">مجاناً</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-foreground pt-4 border-t border-border/50">
                  <span>الإجمالي</span>
                  <span>{getCartTotal().toFixed(2)} ر.س</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={createOrder.isPending}
                className="w-full py-4 rounded-xl font-bold text-lg
                  bg-gradient-to-r from-primary to-primary/80 text-white
                  shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5
                  active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2
                  disabled:opacity-70 disabled:cursor-wait disabled:transform-none"
              >
                {createOrder.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري المعالجة...
                  </span>
                ) : (
                  <>
                    <span>تأكيد الطلب</span>
                    <CheckCircle2 size={20} />
                  </>
                )}
              </button>
              
              {createOrder.isError && (
                <p className="mt-4 text-center text-sm text-destructive bg-destructive/10 py-2 rounded-lg">
                  {createOrder.error.message}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
