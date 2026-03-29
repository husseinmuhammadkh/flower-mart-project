import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User as UserIcon, Mail, Phone, Shield, LogOut, Loader2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // جلب البيانات من المفتاح الموحد 'user'
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setLoading(false);
      } catch (e) {
        localStorage.clear();
        setLocation("/login");
      }
    } else {
      // إذا لم يجد بيانات، انتظر قليلاً ثم حوله للوجن
      const timer = setTimeout(() => {
        setLocation("/login");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [setLocation]);

  const handleLogout = () => {
    // تنظيف شامل لكل شيء في المتصفح لضمان عدم تداخل الحسابات
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 font-['Cairo'] bg-slate-50" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-pink-50 overflow-hidden">
          
          {/* Header Profile */}
          <div className="bg-primary p-8 text-white flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
              <UserIcon size={48} />
            </div>
            <div className="text-center sm:text-right">
              <h2 className="text-3xl font-bold">{user.username}</h2>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-amber-400 text-amber-950' : 'bg-white/20 text-white'}`}>
                  {user.role === 'admin' ? 'مدير النظام' : 'عضو مسجل'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6 text-right">
            {/* User Info Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100/50">
                <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-bold text-foreground">{user.email || "غير متوفر"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100/50">
                <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                  <p className="font-bold text-foreground">{user.phoneNumber || "غير متوفر"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* زر لوحة التحكم يظهر فقط للأدمن */}
              {user.role === "admin" && (
                <Button 
                  onClick={() => setLocation("/admin")}
                  variant="outline"
                  className="w-full py-7 rounded-2xl text-lg font-bold border-primary text-primary hover:bg-primary/5 gap-2"
                >
                  <LayoutDashboard size={20} />
                  لوحة التحكم الإدارية
                </Button>
              )}

              <Button 
                onClick={handleLogout}
                variant="destructive" 
                className="w-full py-7 rounded-2xl text-lg font-bold shadow-lg shadow-red-100 gap-2"
              >
                <LogOut size={20} />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-muted-foreground text-sm">
          جميع بياناتك محمية ومشفرة وفق معايير روزاليا
        </p>
      </div>
    </div>
  );
}