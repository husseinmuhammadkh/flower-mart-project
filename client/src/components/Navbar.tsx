import { Link } from "wouter";
import { useCart } from "@/store/use-cart";
import { ShoppingBag, Flower2 } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { getItemCount, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "py-3 glass shadow-sm" : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Flower2 size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              روزاليا
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-muted-foreground hover:text-primary font-medium transition-colors cursor-pointer">الرئيسية</Link>
            <Link href="/#products" className="text-muted-foreground hover:text-primary font-medium transition-colors cursor-pointer">باقاتنا</Link>
            <Link href="/#about" className="text-muted-foreground hover:text-primary font-medium transition-colors cursor-pointer">من نحن</Link>
          </nav>

          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-foreground hover:text-primary transition-colors"
          >
            <ShoppingBag size={24} />
            {getItemCount() > 0 && (
              <span className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {getItemCount()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
