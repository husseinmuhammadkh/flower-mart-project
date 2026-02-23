import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { CartDrawer } from "./CartDrawer";
import { Flower2 } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-background font-sans flex flex-col relative">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-border/50 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Flower2 size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                روزاليا
              </span>
            </div>
            
            <p className="text-muted-foreground text-sm text-center md:text-right">
              &copy; {new Date().getFullYear()} متجر روزاليا للورود. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
