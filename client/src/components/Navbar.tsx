import { Link } from "wouter";
import { useCart } from "@/store/use-cart";
import { ShoppingBag, UserPlus, LogIn, Flower2, UserCircle, LogOut, LayoutDashboard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Navbar() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const [user, setUser] = useState<any>(null);

  const checkUser = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-50 font-['Cairo']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* الجهة اليمنى: المستخدم والتحكم */}
          <div className="flex items-center gap-2">
            {!user ? (
              <Link href="/login">
                <Button variant="ghost" className="gap-2 text-gray-600 hover:text-primary transition-colors">
                  <LogIn size={18} />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="icon" className="text-amber-600 hover:bg-amber-50" title="لوحة التحكم">
                      <LayoutDashboard size={20} />
                    </Button>
                  </Link>
                )}
                
                <Link href="/profile">
                  <Button variant="ghost" className="gap-2 text-primary font-bold hover:bg-primary/5">
                    <UserCircle size={24} />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </Link>

                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:bg-red-50">
                   <LogOut size={18} />
                </Button>
              </div>
            )}
          </div>

          {/* المنتصف: الشعار */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <span className="text-2xl font-black text-primary tracking-tighter transition-all group-hover:opacity-80">
                ROSALIA
              </span>
              <Flower2 className="text-primary group-hover:rotate-12 transition-transform" size={28} />
            </div>
          </Link>

          {/* الجهة اليسرى: التتبع، السلة وحساب جديد */}
          <div className="flex items-center gap-3">
            {/* زر تتبع الطلب الجديد */}
            <Link href="/track-order">
              <div className="p-2 text-gray-600 hover:text-primary cursor-pointer transition-colors flex items-center gap-1" title="تتبع طلبك">
                <Truck size={24} />
                <span className="hidden md:inline text-sm font-medium">تتبع الطلب</span>
              </div>
            </Link>

            {!user && (
              <Link href="/add-user">
                <Button variant="default" className="hidden sm:flex gap-2 bg-primary hover:bg-primary/90 rounded-full shadow-md shadow-primary/20">
                  <UserPlus size={18} />
                  <span>حساب جديد</span>
                </Button>
              </Link>
            )}

            <Link href="/cart">
              <div className="relative p-2 text-gray-600 hover:text-primary cursor-pointer transition-colors">
                <ShoppingBag size={26} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                    {itemCount}
                  </span>
                )}
              </div>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}