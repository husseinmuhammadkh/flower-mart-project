import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Order } from "@shared/schema";

export default function OrderSuccess() {
  const [, params] = useRoute("/order/:id");
  const orderId = params?.id;

  // جلب بيانات الطلب مع ميزة إعادة المحاولة التلقائية
  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        throw new Error("الطلب غير موجود حالياً");
      }
      return res.json();
    },
    enabled: !!orderId,
    // سيحاول الجلب 5 مرات، بفاصل ثانية بين كل محاولة
    retry: 5,
    retryDelay: 1000,
  });

  // نعرض حالة التحميل طالما أنه يجرب الجلب ولم ينتهِ بعد
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-['Cairo']" dir="rtl">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <span className="text-lg font-bold">جاري تأكيد طلبك...</span>
        <p className="text-sm text-muted-foreground mt-2">يرجى الانتظار لحظة واحدة</p>
      </div>
    );
  }

  // إذا فشل تماماً بعد كل المحاولات ولم يجد الطلب
  if (isError || !order) {
    return (
      <div className="min-h-screen pt-32 text-center font-['Cairo']" dir="rtl">
        <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-red-500">لم يتم العثور على الطلب رقم {orderId}</h2>
          <p className="text-gray-500 mb-8">عذراً، لم نتمكن من العثور على تفاصيل الطلب. يرجى التحقق من لوحة الإدارة.</p>
          <Link href="/">
            <Button className="w-full rounded-2xl h-12">العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 font-['Cairo'] text-right" dir="rtl">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-pink-50">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={50} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black mb-2 text-gray-900">شكراً لطلبك!</h1>
          <p className="text-gray-500 text-lg mb-8">
            تم استلام طلبك بنجاح. رقم الطلب الخاص بك هو: 
            <span className="font-bold text-primary px-2">#{order.id}</span>
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-right">
            <h3 className="font-bold mb-2 border-b pb-2">تفاصيل العميل:</h3>
            <div className="space-y-1 mt-3">
              <p className="text-sm text-gray-600 font-bold">الاسم: <span className="font-normal">{order.customerName}</span></p>
              <p className="text-sm text-gray-600 font-bold">العنوان: <span className="font-normal">{order.customerAddress}</span></p>
              <p className="text-sm text-gray-600 font-bold">الإجمالي: <span className="font-normal text-green-600">{Number(order.total).toFixed(2)} ر.س</span></p>
            </div>
          </div>

          <Link href="/">
            <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg hover:scale-[1.01] transition-transform">
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}