// Admin.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, User, Order } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Trash2, Plus, Users, ShieldAlert, Pencil,
  UserCog, ShoppingBag, Package, MessageCircle, CheckCircle, Loader2, X,
  User as UserIcon, Phone, MapPin, Mail, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<"products" | "users" | "orders">("products");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => await apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح" });
    }
  });

  const updateProduct = useMutation({
    mutationFn: async (updatedData: Product) => {
      return await apiRequest("PATCH", `/api/products/${updatedData.id}`, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "تم التحديث", description: "تم تعديل المنتج بنجاح" });
      setEditingProduct(null);
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

  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Cairo'] text-right" dir="rtl">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border max-w-sm">
          <ShieldAlert size={80} className="mx-auto text-destructive mb-4 animate-pulse" />
          <h1 className="text-3xl font-black">دخول ممنوع!</h1>
          <Button onClick={() => setLocation("/")} className="mt-6 w-full rounded-2xl">العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-muted/20 font-['Cairo'] text-right" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        
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

        {tab === "products" && (
          <div className="space-y-6">
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
                    <p className="text-primary font-bold text-xs">{product.price} د.أ</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" onClick={() => setEditingProduct(product)}>
                      <Pencil size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { if(confirm("حذف المنتج؟")) deleteProduct.mutate(product.id) }}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* نافذة التعديل */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-[2rem] w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">تعديل المنتج</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingProduct(null)}><X size={20}/></Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold px-1">اسم المنتج</label>
                  <Input value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="اسم المنتج" className="rounded-xl" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold px-1">السعر (د.أ)</label>
                  <Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} placeholder="السعر" className="rounded-xl" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold px-1">الوصف</label>
                  <Textarea 
                    value={editingProduct.description || ""} 
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} 
                    placeholder="وصف المنتج..." 
                    className="rounded-xl min-h-[100px] resize-none" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold px-1">رابط الصورة</label>
                  <Input value={editingProduct.imageUrl} onChange={(e) => setEditingProduct({...editingProduct, imageUrl: e.target.value})} placeholder="رابط الصورة" className="rounded-xl text-left" dir="ltr" />
                </div>

                <Button className="w-full rounded-xl py-6 text-lg font-bold mt-2" onClick={() => updateProduct.mutate(editingProduct)} disabled={updateProduct.isPending}>
                  {updateProduct.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Package className="text-primary" /> إدارة الطلبات ({orders?.length || 0})</h2>
            <div className="grid grid-cols-1 gap-6">
              {orders?.slice().reverse().map(order => {
                // فحص الحقل الفعلي المخزن بالداتابيس (إما items أو cart أو products) لمنع الـ undefined
                const rawData = (order as any).cart || (order as any).products || order.items;
                
                let orderItems: any[] = [];
                try {
                  if (typeof rawData === 'string') {
                    orderItems = JSON.parse(rawData);
                  } else if (Array.isArray(rawData)) {
                    orderItems = rawData;
                  }
                } catch (e) {
                  orderItems = [];
                }

                return (
                  <div key={order.id} className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm space-y-6">
                    
                    {/* هيدر الكارد: الرقم والحالة */}
                    <div className="flex justify-between items-center border-b pb-4">
                      <div>
                        <span className="text-xs text-muted-foreground block font-bold">رقم الطلب</span>
                        <span className="text-xl font-black text-slate-800">#{order.id}</span>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {order.status === 'completed' ? 'تم التوصيل' : 'قيد الانتظار'}
                      </span>
                    </div>

                    {/* شبكة معلومات العميل الكاملة */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-muted/30 p-5 rounded-2xl text-sm">
                      <div className="flex items-center gap-2">
                        <UserIcon className="text-primary" size={18} />
                        <div>
                          <span className="text-[10px] text-muted-foreground block">الاسم</span>
                          <strong className="text-slate-700">{order.customerName}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="text-primary" size={18} />
                        <div>
                          <span className="text-[10px] text-muted-foreground block">رقم الهاتف</span>
                          <strong className="text-slate-700" dir="ltr">{order.customerPhone}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="text-primary" size={18} />
                        <div>
                          <span className="text-[10px] text-muted-foreground block">العنوان</span>
                          <strong className="text-slate-700">{order.customerAddress}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="text-primary" size={18} />
                        <div>
                          <span className="text-[10px] text-muted-foreground block">البريد الإلكتروني</span>
                          <strong className="text-slate-700 break-all">{order.customerEmail}</strong>
                        </div>
                      </div>
                    </div>

                    {/* عرض تفاصيل المنتجات داخل الطلب */}
                    {orderItems && orderItems.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm text-slate-800">المنتجات المطلوبة:</h4>
                        <div className="border rounded-2xl overflow-hidden divide-y">
                          {orderItems.map((item: any, idx: number) => {
                            const currentId = item?.productId || item?.id;
                            const matchedProduct = products?.find(p => Number(p.id) === Number(currentId));
                            
                            const productName = matchedProduct?.name || item?.productName || item?.name || `منتج رقم #${currentId}`;
                            const productImg = matchedProduct?.imageUrl || matchedProduct?.image_url || item?.imageUrl || item?.image_url;

                            return (
                              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 text-xs">
                                <div className="flex items-center gap-4">
                                  <img 
                                    src={productImg || "https://images.unsplash.com/photo-1512211878902-601a6072dd33?w=100"} 
                                    className="w-14 h-14 object-cover rounded-xl border" 
                                    alt="" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1512211878902-601a6072dd33?w=100";
                                    }}
                                  />
                                  <div>
                                    <h5 className="font-bold text-sm text-slate-800">{productName}</h5>
                                    {(item?.selectedSize || item?.size) && (
                                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                                        الحجم: {
                                          (item.selectedSize === 'small' || item.size === 'small') ? 'صغير' : 
                                          (item.selectedSize === 'medium' || item.size === 'medium') ? 'وسط' : 'كبير'
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-left font-bold text-slate-600 text-sm">
                                  <span>الكمية: {item?.quantity || 1}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* فوتر الكارد: السعر النهائي والإجراءات */}
                    <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-4 border-t border-dashed">
                      <div className="flex items-center gap-1 text-primary">
                        <span className="text-xs font-bold">الإجمالي النهائي:</span>
                        <span className="text-2xl font-black">{order.total} د.أ</span>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          className="rounded-xl gap-2 border-green-500 text-green-600 flex-1 sm:flex-none" 
                          onClick={() => {
                            let phone = order.customerPhone.replace(/\D/g, '');
                            if (phone.startsWith('0')) {
                              phone = '962' + phone.substring(1);
                            }
                            window.open(`https://wa.me/${phone}`, '_blank');
                          }}
                        >
                          <MessageCircle size={18} /> واتساب
                        </Button>
                        {order.status !== 'completed' && (
                          <Button className="rounded-xl gap-2 flex-1 sm:flex-none" onClick={() => updateOrderStatus.mutate({ id: order.id, status: 'completed' })}>
                            <CheckCircle size={18} /> اكتمل الطلب
                          </Button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-6">
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