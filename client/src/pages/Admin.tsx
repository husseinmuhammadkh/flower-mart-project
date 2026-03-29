import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, User, Order } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Trash2, Plus, Users, ShieldAlert, 
  UserCog, ShoppingBag, Package, MessageCircle, CheckCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<"products" | "users" | "orders">("products");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // 1. حماية الصفحة والتحقق من الرتبة
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        setTimeout(() => setLocation("/"), 2000);
      }
    } else {
      setIsAdmin(false);
      setLocation("/login");
    }
  }, [setLocation]);

  // 2. جلب البيانات
  const { data: products } = useQuery<Product[]>({ 
    queryKey: ["/api/products"],
    enabled: isAdmin === true 
  });
  const { data: users } = useQuery<User[]>({ 
    queryKey: ["/api/users"],
    enabled: isAdmin === true 
  });
  const { data: orders } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"],
    enabled: isAdmin === true 
  });

  // 3. العمليات (Mutations)
  const deleteProduct = useMutation({
    mutationFn: async (id: number) => await apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح" });
    }
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => 
      await apiRequest("PATCH", `/api/orders/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "تم التحديث", description: "تم تغيير حالة الطلب" });
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => await apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "تم الحذف", description: "تم حذف المستخدم بنجاح" });
    }
  });

  const toggleRole = useMutation({
    mutationFn: async ({ id, role }: { id: number, role: string }) => 
      await apiRequest("PATCH", `/api/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "تم التحديث", description: "تم تغيير الرتبة بنجاح" });
    },
  });

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Cairo']">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Cairo'] text-right" dir="rtl">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border max-w-sm">
          <ShieldAlert size={80} className="mx-auto text-destructive mb-4 animate-pulse" />
          <h1 className="text-3xl font-black">دخول ممنوع!</h1>
          <p className="text-muted-foreground mt-2">عذراً، هذه المنطقة مخصصة للمديرين فقط.</p>
          <Button onClick={() => setLocation("/")} className="mt-6 w-full rounded-2xl">العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-muted/20 font-['Cairo'] text-right" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-foreground flex items-center gap-3">
              <UserCog className="text-primary" size={40} /> لوحة التحكم
            </h1>
            <p className="text-muted-foreground mt-2">إدارة المتجر، المنتجات، والطلبات</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border overflow-x-auto">
            <Button variant={tab === "products" ? "default" : "ghost"} onClick={() => setTab("products")} className="rounded-xl px-6">المنتجات</Button>
            <Button variant={tab === "orders" ? "default" : "ghost"} onClick={() => setTab("orders")} className="rounded-xl px-6">الطلبات</Button>
            <Button variant={tab === "users" ? "default" : "ghost"} onClick={() => setTab("users")} className="rounded-xl px-6">المستخدمين</Button>
          </div>
        </div>

        {/* 1. المنتجات */}
        {tab === "products" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag className="text-primary" /> المنتجات ({products?.length || 0})</h2>
              <Button onClick={() => setLocation("/add-product")} className="rounded-xl gap-2"><Plus size={18} /> إضافة منتج</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products?.map(product => (
                <div key={product.id} className="bg-card p-4 rounded-3xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <img src={product.imageUrl} className="w-16 h-16 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                    <p className="text-primary font-bold text-xs">{product.price} ر.س</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { if(confirm("حذف المنتج؟")) deleteProduct.mutate(product.id) }}><Trash2 size={18} /></Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. الطلبات */}
        {tab === "orders" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Package className="text-primary" /> إدارة الطلبات ({orders?.length || 0})</h2>
            <div className="grid grid-cols-1 gap-4">
              {orders?.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">رقم الطلب: #{order.id}</span>
                      <h3 className="font-bold text-lg">{order.customerName}</h3>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {order.status === 'completed' ? 'تم التوصيل' : 'قيد الانتظار'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-muted/30 p-4 rounded-2xl mb-4 text-right">
                    <p><strong>العنوان:</strong> {order.customerAddress}</p>
                    <p><strong>الهاتف:</strong> {order.customerPhone}</p>
                    <p><strong>الإجمالي:</strong> {order.total} ر.س</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" className="rounded-xl gap-2 border-green-500 text-green-600" onClick={() => window.open(`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`, '_blank')}>
                      <MessageCircle size={18} /> واتساب
                    </Button>
                    {order.status !== 'completed' && (
                      <Button className="rounded-xl gap-2" onClick={() => updateOrderStatus.mutate({ id: order.id, status: 'completed' })}>
                        <CheckCircle size={18} /> اكتمل الطلب
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {orders?.length === 0 && <div className="text-center py-20 bg-white rounded-3xl border border-dashed">لا توجد طلبات بعد.</div>}
            </div>
          </div>
        )}

        {/* 3. المستخدمين */}
        {tab === "users" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="text-primary" /> الأعضاء ({users?.length || 0})</h2>
            <div className="bg-card rounded-3xl border shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr><th className="p-4">المستخدم</th><th className="p-4">الرتبة</th><th className="p-4">الإجراءات</th></tr>
                </thead>
                <tbody>
                  {users?.map(user => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-4 font-bold">{user.username}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg h-8" onClick={() => toggleRole.mutate({ id: user.id, role: user.role === 'admin' ? 'user' : 'admin' })}>تغيير الرتبة</Button>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => { if(confirm("حذف المستخدم؟")) deleteUser.mutate(user.id); }}><Trash2 size={16} /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}