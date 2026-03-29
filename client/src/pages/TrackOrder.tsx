import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Truck, Package, CheckCircle } from "lucide-react";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [searchId, setSearchId] = useState<string | null>(null);

  const { data: order, isLoading, error } = useQuery({
    queryKey: [`/api/orders/${searchId}`],
    enabled: !!searchId,
  });

  const getStatusIcon = (status: string) => {
    if (status === "delivered") return <CheckCircle className="text-green-500 w-12 h-12" />;
    if (status === "shipped") return <Truck className="text-blue-500 w-12 h-12" />;
    return <Package className="text-pink-500 w-12 h-12" />;
  };

  const statusMap: Record<string, string> = {
    "pending": "بانتظار التأكيد",
    "processing": "جاري التجهيز 🌸",
    "shipped": "في الطريق إليك 🚚",
    "delivered": "تم التوصيل بنجاح ✨",
    "cancelled": "تم إلغاء الطلب"
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-[70vh] flex flex-col items-center">
      <h1 className="text-3xl font-bold text-pink-600 mb-8">تتبع طلبك 🌸</h1>
      
      <div className="flex gap-2 w-full max-w-md mb-10">
        <Input 
          placeholder="أدخل رقم الطلب (مثلاً: 5)" 
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <Button onClick={() => setSearchId(orderId)} className="bg-pink-600 hover:bg-pink-700">
          <Search className="ml-2 h-4 w-4" /> بحث
        </Button>
      </div>

      {isLoading && <Loader2 className="animate-spin text-pink-600" />}

      {error && <p className="text-red-500">عذراً، لم نجد طلباً بهذا الرقم.</p>}

      {order && (
        <Card className="w-full max-w-lg border-2 border-pink-100 shadow-lg animate-in fade-in zoom-in duration-300">
          <CardHeader className="text-center border-b">
            <CardTitle>تفاصيل الطلب #{order.id}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="mb-4">{getStatusIcon(order.status)}</div>
            <h2 className="text-2xl font-semibold mb-2">{statusMap[order.status] || order.status}</h2>
            <p className="text-gray-500 mb-6">{statusMap[order.status] || order.status} طلبك الآن في مرحلة {statusMap[order.status]}  {order.customerName},مرحباً</p>
            
            <div className="w-full bg-gray-50 p-4 rounded-lg text-right">
              <p><strong>الاسم:</strong> {order.customerName}</p>
              <p><strong>الإجمالي:</strong> {order.total} ر.س</p>
              <p><strong>العنوان:</strong> {order.customerAddress}</p>
              <p><strong>رقم الجوال:</strong> {order.customerPhone}</p>            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}