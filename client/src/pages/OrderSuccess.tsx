import { useParams, Link } from "wouter";
import { useOrder } from "@/hooks/use-orders";
import { CheckCircle2, Package, ArrowRight, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-muted rounded-full mb-6" />
          <div className="h-6 bg-muted rounded w-48 mb-4" />
          <div className="h-4 bg-muted rounded w-64" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">لم يتم العثور على الطلب</h1>
        <Link href="/" className="text-primary hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-muted/30 flex items-center justify-center">
      <div className="max-w-2xl w-full px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-[2rem] p-8 sm:p-12 shadow-xl shadow-black/5 border border-border/50 text-center"
        >
          <div className="w-24 h-24 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="absolute inset-0 bg-secondary rounded-full opacity-20 animate-ping"
            />
            <CheckCircle2 size={48} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            شكراً لك، {order.customerName.split(' ')[0]}!
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            تم استلام طلبك بنجاح وجاري تجهيزه بكل حب وعناية.
          </p>

          <div className="bg-background rounded-2xl p-6 text-right mb-10 border border-border">
            <h3 className="font-bold text-lg mb-4 border-b border-border/50 pb-4">تفاصيل الطلب</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="text-primary mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">رقم الطلب</p>
                  <p className="font-semibold text-foreground">#{order.id.toString().padStart(5, '0')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="text-primary mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                  <p className="font-semibold text-foreground">
                    {order.createdAt ? format(new Date(order.createdAt), 'dd MMMM yyyy, hh:mm a', { locale: ar }) : 'الآن'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">عنوان التوصيل</p>
                  <p className="font-semibold text-foreground">{order.customerAddress}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
              <span className="font-medium text-muted-foreground">الإجمالي المدفوع</span>
              <span className="text-2xl font-bold text-primary">{Number(order.total).toFixed(2)} ر.س</span>
            </div>
          </div>

          <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-full font-bold transition-colors w-full sm:w-auto">
            <ArrowRight size={20} />
            <span>العودة للتسوق</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
