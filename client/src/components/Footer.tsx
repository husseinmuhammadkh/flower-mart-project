import { Link } from "wouter";
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-20 font-['Cairo'] text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* قسم عن المتجر */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-primary">روزاليا</h3>
            <p className="text-muted-foreground leading-relaxed">
              متجرك الأول للزهور والهدايا الفاخرة. نسعى دائمًا لنشر السعادة والجمال في كل مناسباتكم.
            </p>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 className="font-bold text-lg mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">السلة</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">حسابي</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">من نحن</Link></li>
            </ul>
          </div>

          {/* معلومات التواصل */}
          <div>
            <h4 className="font-bold text-lg mb-6">تواصل معنا</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-primary" />
                <span>المملكة العربية السعودية، الرياض</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary" />
                <span>+966 500 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary" />
                <span>info@rosalia.com</span>
              </li>
            </ul>
          </div>

          {/* التواصل الاجتماعي */}
          <div>
            <h4 className="font-bold text-lg mb-6">تابعنا على</h4>
            <div className="flex gap-4">
              {/* واتساب */}
              <a href="https://wa.me/966500000000" target="_blank" className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all">
                <MessageCircle size={24} />
              </a>
              {/* انستقرام */}
              <a href="https://instagram.com" target="_blank" className="p-3 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-600 hover:text-white transition-all">
                <Instagram size={24} />
              </a>
              {/* فيسبوك */}
              <a href="https://facebook.com" target="_blank" className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                <Facebook size={24} />
              </a>
            </div>
          </div>

        </div>

        <hr className="my-10 border-border" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 متجر روزاليا. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">سياسة الخصوصية</a>
            <a href="#" className="hover:underline">شروط الاستخدام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}