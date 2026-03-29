import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { UserPlus, Phone, Mail, Lock, User as UserIcon, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateUser() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phoneNumber: "",
    role: "user"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const newUser = await response.json();

      if (!response.ok) throw new Error("فشل في إنشاء المستخدم");

      toast({ title: "تم بنجاح", description: "أهلاً بك في روزاليا!" });

      // --- التعديل هنا لربط المستخدم الجديد بالبروفايل ---
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      
      // التوجيه للبروفايل بدلاً من الرئيسية
      setLocation("/profile"); 
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ", description: "تأكد من البيانات المدخلة" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-muted/30 font-['Cairo']" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-4 bg-card rounded-[2.5rem] shadow-xl border border-border/50 overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-primary" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-foreground">إنشاء حساب جديد</h2>
            <p className="text-muted-foreground mt-2">انضم إلى عالم روزاليا للزهور</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <UserIcon className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <input
                required
                type="text"
                placeholder="اسم المستخدم"
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="relative">
              <Mail className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <input
                required
                type="email"
                placeholder="البريد الإلكتروني"
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <Phone className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <input
                required
                type="text"
                placeholder="رقم الهاتف"
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <input
                required
                type="password"
                placeholder="كلمة المرور"
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="relative">
              <ShieldCheck className="absolute right-4 top-3.5 text-muted-foreground" size={20} />
              <select
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all text-right"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="user">مستخدم عادي</option>
                <option value="admin">مدير (Admin)</option>
              </select>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}