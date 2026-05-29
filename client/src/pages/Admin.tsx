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
        setLocation("/");
      }
    } else {
      setIsAdmin(false);
      setLocation("/auth");
    }
  }, [setLocation]);

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAdmin === true
  });

  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin === true
  });

  const { data: orders, isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAdmin === true
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "تم الحذف", description: "تم إزالة المنتج من المتجر" });
    }
  });

  const updateProduct = useMutation({
    mutationFn: async (product: Product) => {
      const res = await apiRequest("PATCH", `/api/products/${product.id}`, product);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      toast({ title: "تم التحديث", description: "تم حفظ التعديلات بنجاح" });
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "تم الحذف", description: "تم حذف حساب المستخدم" });
    }
  });

  const toggleRole = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "تم تحديث الرتبة", description: "تم تغيير صلاحيات المستخدم" });
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "تم التحديث", description: "تم تحديث حالة الطلب وإرسال بريد للعميل" });
    }
  });

  if (isAdmin === null || loadingProducts || loadingUsers || loadingOrders) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-background to-muted/30 font-['Cairo'] text-right animate-fade-in" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* العناوين والتبويبات */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-primary" /> لوحة الإشراف والتحكم
            </h1>
            <p className="text-sm text-muted-foreground mt-1">إدارة المنتجات، متابعة الطلبات الواردة، وصلاحيات المستخدمين</p>
          </div>
          
          {tab === "products" && (
            <Button onClick={() => setLocation("/admin/add-product")} className="rounded-xl font-bold gap-2 shadow-md">
              <Plus size={18} /> إضافة منتج جديد
            </Button>
          )}
        </div>

        {/* أزرار التنقل السريعة بين الأقسام */}
        <div className="flex border-b border-border mb-8 gap-2 overflow-x-auto pb-1">
          <button onClick={() => setTab("products")} className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all flex items-center gap-2 ${tab === "products" ? "bg-white border-x border-t text-primary border-border" : "text-muted-foreground hover:text-foreground"}`}>
            <Package size={18} /> المنتجات ({products?.length || 0})
          </button>
          <button onClick={() => setTab("orders")} className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all flex items-center gap-2 ${tab === "orders" ? "bg-white border-x border-t text-primary border-border" : "text-muted-foreground hover:text-foreground"}`}>
            <ShoppingBag size={18} /> الطلبات ({orders?.length || 0})
          </button>
          <button onClick={() => setTab("users")} className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all flex items-center gap-2 ${tab === "users" ? "bg-white border-x border-t text-primary border-border" : "text-muted-foreground hover:text-foreground"}`}>
            <Users size={18} /> المستخدمين ({users?.length || 0})
          </button>
        </div>

        {/* عرض تبويب المنتجات */}
        {tab === "products" && (
          <div className="bg-white rounded-[2rem] border border-border/50 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-muted/50 border-b font-bold text-slate-700">
                  <tr>
                    <th className="p-4">الصورة</th>
                    <th className="p-4">المنتج</th>
                    <th className="p-4">التصنيف</th>
                    <th className="p-4">السعر الافتراضي</th>
                    <th className="p-4">أسعار المقاسات (S / M / L / XL)</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map(product => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg border" />
                      </td>
                      <td className="p-4 font-bold text-slate-800">{product.name}</td>
                      <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded-md text-xs">{product.category}</span></td>
                      <td className="p-4 font-bold text-primary">{Number(product.price).toFixed(2)} د.أ</td>
                      <td className="p-4 text-xs text-slate-600 font-mono">
                        S: {Number((product as any).priceS || 0).toFixed(2)} | 
                        M: {Number((product as any).priceM || 0).toFixed(2)} | 
                        L: {Number((product as any).priceL || 0).toFixed(2)} | 
                        XL: {Number((product as any).priceXL || 0).toFixed(2)}
                      </td>
                      <td className="p-4 flex gap-2 pt-6">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-blue-600" onClick={() => setEditingProduct(product)}>
                          <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive" onClick={() => { if(confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) deleteProduct.mutate(product.id); }}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* عرض تبويب المستخدمين */}
        {tab === "users" && (
          <div className="bg-white rounded-[2rem] border border-border/50 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
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

        {/* عرض تبويب الطلبات المطور والكامل */}
        {tab === "orders" && (
          <div className="space-y-6">
            {orders?.map((order: any) => (
              <div key={order.id} className="bg-white border rounded-[2rem] p-6 shadow-md hover:shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 mb-4">
                  <div>
                    <span className="text-xs bg-slate-100 font-bold px-3 py-1 rounded-full text-slate-600">طلب رقم #{order.id}</span>
                    <h3 className="font-black text-xl text-slate-800 mt-1 flex items-center gap-2"><UserIcon size={18} className="text-primary" /> {order.customerName}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xl text-primary">{Number(order.total || 0).toFixed(2)} د.أ</span>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                      className={`p-2 px-4 rounded-xl font-bold text-xs border outline-none cursor-pointer ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' : order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' : order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                    >
                      <option value="pending">قيد الانتظار ⏳</option>
                      <option value="processing">جاري التجهيز 🌸</option>
                      <option value="shipped">تم الشحن مع المندوب 🚚</option>
                      <option value="delivered">تم التوصيل بنجاح ✨</option>
                      <option value="cancelled">ملغي ❌</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* معلومات العميل للتوصيل */}
                  <div className="space-y-2 text-sm text-slate-600 border-l pl-4">
                    <p className="flex items-center gap-2"><Phone size={16} /> <b>الهاتف:</b> <span dir="ltr">{order.customerPhone}</span></p>
                    <p className="flex items-center gap-2"><Mail size={16} /> <b>البريد:</b> {order.customerEmail}</p>
                    <p className="flex items-center gap-2"><MapPin size={16} /> <b>العنوان:</b> {order.customerAddress}</p>
                  </div>

                  {/* تفاصيل المنتجات المشتراة مع المقاسات والملاحظات */}
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><Package size={16} /> عناصر الطلب والتعديلات المخصصة:</h4>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2">
                      {order.items?.map((item: any, i: number) => {
                        // البحث عن اسم المنتج من مصفوفة المنتجات المتوفرة
                        const matchedProd = products?.find(p => p.id === item.productId);
                        return (
                          <div key={i} className="flex justify-between items-start text-xs border-b last:border-0 pb-2 last:pb-0 gap-4">
                            <div>
                              <span className="font-bold text-slate-800 text-sm">{matchedProd?.name || `منتج #${item.productId}`}</span>
                              <span className="text-slate-500 mr-2">x {item.quantity}</span>
                              
                              {/* عرض المقاس المختار */}
                              <div className="text-primary font-bold mt-1">
                                الحجم: {
                                  item.selectedSize === "small" ? "صغير (S)" :
                                  item.selectedSize === "medium" ? "وسط (M)" :
                                  item.selectedSize === "large" ? "كبير (L)" : "كبير جداً (XL)"
                                }
                              </div>

                              {/* عرض ملاحظات العميل المخصصة للتغليف أو الكرت */}
                              {item.customNotes && (
                                <div className="mt-1 bg-white border border-slate-200 p-1.5 px-2.5 rounded-lg text-slate-600 inline-block max-w-full break-words">
                                  <span className="font-black text-slate-700 ml-1">تعديل العميل:</span>
                                  {item.customNotes}
                                </div>
                              )}
                            </div>
                            <span className="font-bold font-mono text-slate-700">{(Number(item.priceAtTime || 0) * item.quantity).toFixed(2)} د.أ</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* نافذة تعديل المنتج المنبثقة (Edit Modal) */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative border" dir="rtl">
              <button onClick={() => setEditingProduct(null)} className="absolute left-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
              
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Pencil size={22} className="text-primary" /> تعديل تفاصيل المنتج</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); updateProduct.mutate(editingProduct); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">اسم المنتج</label>
                  <Input value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">التصنيف</label>
                  <select className="w-full p-2.5 bg-muted rounded-xl border text-sm outline-none" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                    <option value="باقات">باقات ورود</option>
                    <option value="فازات">فازات زجاجية</option>
                    <option value="صناعي">ورد صناعي</option>
                    <option value="هدايا">هدايا وشوكولاتة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">السعر الافتراضي (د.أ)</label>
                  <Input type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} required />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary">سعر الحجم الصغير (S)</label>
                  <Input type="number" step="0.01" value={(editingProduct as any).priceS || "0.00"} onChange={e => setEditingProduct({...editingProduct, priceS: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary">سعر الحجم الوسط (M)</label>
                  <Input type="number" step="0.01" value={(editingProduct as any).priceM || "0.00"} onChange={e => setEditingProduct({...editingProduct, priceM: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary">سعر الحجم الكبير (L)</label>
                  <Input type="number" step="0.01" value={(editingProduct as any).priceL || "0.00"} onChange={e => setEditingProduct({...editingProduct, priceL: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary">سعر الحجم كبير جداً (XL)</label>
                  <Input type="number" step="0.01" value={(editingProduct as any).priceXL || "0.00"} onChange={e => setEditingProduct({...editingProduct, priceXL: e.target.value})} />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600">رابط صورة المنتج</label>
                  <Input type="url" value={editingProduct.imageUrl} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} required />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600">الوصف</label>
                  <Textarea rows={3} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} required />
                </div>

                <div className="sm:col-span-2 flex gap-3 pt-4">
                  <Button type="submit" disabled={updateProduct.isPending} className="flex-1 rounded-xl py-5 font-bold">حفظ التغييرات</Button>
                  <Button type="button" variant="outline" className="rounded-xl py-5" onClick={() => setEditingProduct(null)}>إلغاء</Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}