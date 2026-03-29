import { motion } from "framer-motion";
import { Heart, Star, Truck, ShieldCheck } from "lucide-react";

export default function About() {
  const features = [
    { icon: <Heart className="text-primary" size={30} />, title: "صُنع بكل حب", desc: "نختار كل زهرة بعناية لضمان وصول مشاعرك الصادقة." },
    { icon: <Star className="text-primary" size={30} />, title: "جودة ممتازة", desc: "أزهارنا طازجة ومستوردة من أفضل المزارع العالمية." },
    { icon: <Truck className="text-primary" size={30} />, title: "توصيل سريع", desc: "نضمن وصول باقتك في الوقت المحدد وبحالتها المثالية." },
    { icon: <ShieldCheck className="text-primary" size={30} />, title: "ثقة وأمان", desc: "نتعامل مع طلباتكم بمنتهى الخصوصية والاحترافية." },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 font-['Cairo'] text-right" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* الجزء العلوي: القصة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-black mb-6 text-foreground">قصة <span className="text-primary">روزاليا</span></h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              بدأت رحلتنا في "روزاليا" من شغف عميق بالزهور وقدرتها السحرية على تغيير مزاج الإنسان ونقل مشاعره دون كلمات. نحن لسنا مجرد متجر زهور، بل نحن شركاء في تخليد لحظاتكم السعيدة.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              منذ انطلاقتنا، وضعنا نصب أعيننا معايير الجودة العالية والتصاميم المبتكرة التي تجمع بين الفخامة الكلاسيكية واللمسات العصرية، لنهديكم تجربة بصرية وعطرية لا تُنسى.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="rounded-[3rem] overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
          >
            <img 
              src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800" 
              alt="Rosalia Flowers"
              className="w-full h-[400px] object-cover"
            />
          </motion.div>
        </div>

        {/* الجزء السفلي: المميزات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2rem] border border-border shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}