import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite"; // تم إزالة log من هنا
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

// إعادة دالة الـ log لمكانها الأصلي في index.ts
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const app = express();

// --- نظام الحماية المعدل (بدون حجب Vite) ---
app.use(helmet({
  contentSecurityPolicy: false, // لضمان عمل الواجهة والصور
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { message: "طلبات كثيرة جداً، يرجى المحاولة لاحقاً" },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use("/api", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 1. إعداد الجلسات
app.use(
  session({
    secret: "rosalia-flower-shop-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false, 
      httpOnly: true,
    },
  })
);

// تسجيل الوقت للطلبات
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  const server = createServer(app);
  
  // تشغيل المسارات
  await registerRoutes(app, server);

  // معالج الأخطاء
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // تشغيل Vite أو الملفات الثابتة حسب البيئة
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    // الترتيب الصحيح لمشروعك: السيرفر أولاً ثم التطبيق
    await setupVite(server, app); 
  }

  app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
})();
// تعديل