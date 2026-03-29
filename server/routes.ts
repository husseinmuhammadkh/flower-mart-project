import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertReviewSchema, checkoutSchema, insertProductSchema } from "@shared/schema";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// 1. إعداد مرسل البريد
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'hm2653601@gmail.com',
    pass: 'vanz ctjr cyup kvpo'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// --- وظائف الحماية (Middleware) ---
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) return res.status(401).json({ message: "غير مصرح لك" });
  const user = await storage.getUser(req.session.userId);
  if (user?.role === 'admin') return next();
  res.status(403).json({ message: "هذه الصلاحية للمديرين فقط" });
};

export async function registerRoutes(app: Express, httpServer: Server): Promise<Server> {

  // --- 1. نظام المستخدمين ---
  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) return res.status(401).send();
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.status(401).send();
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "البيانات غير صالحة، تأكد من الشروط" });
      }
      const allUsers = await storage.getUsers();
      const existingUser = allUsers.find(u => u.username === result.data.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم موجود مسبقاً" });
      }
      const user = await storage.createUser(result.data);
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err) {
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحساب" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const allUsers = await storage.getUsers();
      const user = allUsers.find(u => u.username === username);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: "حدث خطأ في عملية تسجيل الدخول" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "فشل تسجيل الخروج" });
      res.clearCookie("connect.sid");
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  // --- 2. إدارة الأعضاء (للمديرين فقط) ---
  app.get("/api/users", isAdmin, async (_req, res) => {
    const allUsers = await storage.getUsers();
    res.json(allUsers.map(({ password, ...u }) => u));
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    await storage.deleteUser(Number(req.params.id));
    res.sendStatus(204);
  });

  app.patch("/api/users/:id/role", isAdmin, async (req, res) => {
    const updatedUser = await storage.updateUserRole(Number(req.params.id), req.body.role);
    res.json(updatedUser);
  });

  // --- 3. مسارات المنتجات ---
  app.get("/api/products", async (_req, res) => res.json(await storage.getProducts()));

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    product ? res.json(product) : res.status(404).json({ message: "المنتج غير موجود" });
  });

  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const result = insertProductSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "بيانات المنتج غير صحيحة" });
      const product = await storage.createProduct(result.data);
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ message: "فشل في إضافة المنتج" });
    }
  });

  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.sendStatus(204);
  });

  // --- 4. التقييمات ---
  app.get("/api/products/:id/reviews", async (req, res) => {
    res.json(await storage.getReviewsByProduct(Number(req.params.id)));
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const result = insertReviewSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "بيانات التقييم غير صالحة" });
      const review = await storage.createReview(result.data);
      res.status(201).json(review);
    } catch (err) {
      res.status(400).json({ message: "حدث خطأ أثناء إضافة التقييم" });
    }
  });

  // --- 5. الطلبات ---

  // إضافة المسار المفقود: جلب كل الطلبات للإدمن
  app.get("/api/orders", isAdmin, async (_req, res) => {
    try {
      const allOrders = await storage.getOrders();
      res.json(allOrders);
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب قائمة الطلبات" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(Number(req.params.id));
      if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات الطلب" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const result = checkoutSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "بيانات الطلب غير مكتملة أو خاطئة" });
      
      const validatedData = result.data;
      const order = await storage.createOrder(validatedData);
      const allProducts = await storage.getProducts();
      
      const orderItemsHtml = validatedData.items.map(item => {
        const product = allProducts.find(p => p.id === item.productId);
        return `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; text-align: right;">${product?.name || 'منتج'}</td>
            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; text-align: left;">${(Number(product?.price || 0) * item.quantity)} ر.س</td>
          </tr>
        `;
      }).join('');

      const mailOptions = {
        from: '"متجر روزاليا 🌸" <hm2653601@gmail.com>',
        to: order.customerEmail,
        subject: `تأكيد طلبك رقم #${order.id} - متجر روزاليا 🌸`,
        html: `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; border-radius: 20px; overflow: hidden; color: #333;">
            <div style="background: linear-gradient(135deg, #d41d6d 0%, #ff85a1 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">شكراً لثقتك بمتجر روزاليا!</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">لقد استلمنا طلبك رقم #${order.id} بنجاح</p>
            </div>
            <div style="padding: 20px;">
              <h3 style="color: #d41d6d; border-bottom: 2px solid #fce4ec; padding-bottom: 10px;">ملخص الطلب:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #fdf2f8;">
                    <th style="padding: 10px; text-align: right;">المنتج</th>
                    <th style="padding: 10px; text-align: center;">الكمية</th>
                    <th style="padding: 10px; text-align: left;">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
              <div style="margin-top: 20px; background: #fff5f8; padding: 15px; border-radius: 12px; text-align: left;">
                <p style="margin: 0; font-size: 18px;"><b>الإجمالي النهائي:</b> <span style="color: #d41d6d; font-weight: bold;">${order.total} ر.س</span></p>
              </div>
              <h3 style="color: #d41d6d; margin-top: 30px;">بيانات التوصيل:</h3>
              <div style="background: #fafafa; padding: 15px; border-radius: 12px; font-size: 14px;">
                <p><b>الاسم:</b> ${order.customerName}</p>
                <p><b>العنوان:</b> ${order.customerAddress}</p>
                <p><b>الجوال:</b> ${order.customerPhone}</p>
              </div>
            </div>
          </div>
        `
      };

      transporter.sendMail(mailOptions).catch(e => console.error("Mail error:", e.message));
      res.status(201).json(order);
    } catch (err) {
      res.status(400).json({ message: "حدث خطأ أثناء معالجة الطلب" });
    }
  });

  app.patch("/api/orders/:id", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const orderId = Number(req.params.id);
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      const statusMessages: Record<string, string> = {
        "processing": "جاري تجهيز طلبك الآن بكل حب 🌸",
        "shipped": "أبشر! طلبك في الطريق إليك الآن 🚚",
        "delivered": "تم توصيل طلبك، نتمنى أن تنال الورود إعجابك! ✨",
        "cancelled": "للأسف، تم إلغاء طلبك. تواصل معنا للمزيد من التفاصيل."
      };

      const mailOptions = {
        from: '"متجر روزاليا 🌸" <hm2653601@gmail.com>',
        to: updatedOrder.customerEmail,
        subject: `تحديث جديد لطلبك رقم #${updatedOrder.id}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #f0f0f0; border-radius: 15px; padding: 20px; text-align: center;">
            <h2 style="color: #d41d6d;">تحديث لطلبك 🌸</h2>
            <p style="font-size: 16px; color: #333;">أهلاً ${updatedOrder.customerName}،</p>
            <p style="font-size: 18px; font-weight: bold; color: #d41d6d;">${statusMessages[status] || "تم تحديث حالة طلبك"}</p>
            <div style="background: #fafafa; padding: 10px; margin-top: 20px; border-radius: 10px;">
              <p style="margin: 5px 0;">رقم الطلب: #${updatedOrder.id}</p>
              <p style="margin: 5px 0;">الحالة الحالية: ${status}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">شكراً لاختيارك متجر روزاليا</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions).catch(e => console.error("Update mail error:", e));
      res.json(updatedOrder);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث حالة الطلب" });
    }
  });

  return httpServer;
}