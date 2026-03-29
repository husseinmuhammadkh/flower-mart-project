import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Flower2, LogIn, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. تنظيف أي بيانات مستخدم قديم تماماً
        localStorage.clear();

        // 2. حفظ بيانات المستخدم الجديد
        localStorage.setItem("user", JSON.stringify(data));

        toast({
          title: "أهلاً بك مجدداً!",
          description: `تم تسجيل دخولك بنجاح`,
        });

        // 3. التوجيه إلى الصفحة الرئيسية (/) بدلاً من (/profile)
        // استخدام window.location.href يضمن تحديث الـ Navbar فوراً
        window.location.href = "/";
        
      } else {
        throw new Error(data.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل الدخول",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 pt-20 font-['Cairo']" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 relative overflow-hidden">
          
          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 animate-bounce">
              <Flower2 size={32} />
            </div>
            <h1 className="text-3xl font-bold text-foreground">روزاليا</h1>
            <p className="text-muted-foreground mt-2">سجل دخولك للمتابعة في المتجر</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="relative group">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                required
                placeholder="اسم المستخدم"
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="password"
                required
                placeholder="كلمة المرور"
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link href="/add-user">
                <span className="text-primary font-bold hover:underline cursor-pointer transition-all">
                  أنشئ حساباً الآن
                </span>
              </Link>
            </p>
          </div>
        </div>

        <Link href="/">
          <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground hover:text-primary transition-colors group cursor-pointer">
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            <span>العودة للرئيسية</span>
          </div>
        </Link>
      </div>
    </div>
  );
}