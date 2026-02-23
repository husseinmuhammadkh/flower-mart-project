import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.products.list.path, async (req, res) => {
    try {
      const allProducts = await storage.getProducts();
      res.json(allProducts);
    } catch (err) {
      res.status(500).json({ message: "خطأ في السيرفر الداخلي" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    try {
      const product = await storage.getProduct(Number(req.params.id));
      if (!product) {
        return res.status(404).json({ message: 'المنتج غير موجود' });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "خطأ في السيرفر الداخلي" });
    }
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      if (err instanceof Error) {
         return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "خطأ في السيرفر الداخلي" });
    }
  });

  app.get(api.orders.get.path, async (req, res) => {
    try {
      const order = await storage.getOrder(Number(req.params.id));
      if (!order) {
        return res.status(404).json({ message: 'الطلب غير موجود' });
      }
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "خطأ في السيرفر الداخلي" });
    }
  });

  // Call seed database
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  try {
    const existingProducts = await storage.getProducts();
    if (existingProducts.length === 0) {
      const { db } = await import('./db');
      const { products } = await import('@shared/schema');
      
      await db.insert(products).values([
        {
          name: "باقة الورد الجوري الأحمر",
          description: "باقة رائعة من الورد الجوري الأحمر الفاخر، تعبر عن الحب العميق.",
          price: "150.00",
          imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&auto=format&fit=crop",
          category: "باقات حب",
          inStock: true
        },
        {
          name: "تنسيق زهور التوليب الناعمة",
          description: "مجموعة من أزهار التوليب الوردية والبيضاء في مزهرية زجاجية أنيقة.",
          price: "120.00",
          imageUrl: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&auto=format&fit=crop",
          category: "هدايا",
          inStock: true
        },
        {
          name: "زنبق الكازابلانكا",
          description: "زهور زنبق بيضاء ناصعة ذات رائحة عطرة تضفي أجواء من السكينة.",
          price: "90.00",
          imageUrl: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&auto=format&fit=crop",
          category: "ديكور منزلي",
          inStock: true
        },
        {
          name: "مزيج الأوركيد والفريزيا",
          description: "أناقة الأوركيد وجاذبية الفريزيا في باقة مذهلة للمناسبات السعيدة.",
          price: "200.00",
          imageUrl: "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800&auto=format&fit=crop",
          category: "مناسبات خاصة",
          inStock: true
        },
        {
          name: "باقة دوار الشمس المشرقة",
          description: "مزيج مشرق ودافئ من زهور دوار الشمس لإدخال البهجة والسرور.",
          price: "110.00",
          imageUrl: "https://images.unsplash.com/photo-1473280025148-643f9b0cbac2?w=800&auto=format&fit=crop",
          category: "أصدقاء",
          inStock: true
        }
      ]);
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
