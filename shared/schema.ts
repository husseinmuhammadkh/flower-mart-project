// schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// جدول المنتجات
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  priceS: numeric("price_s", { precision: 10, scale: 2 }).default("0.00").notNull(), // سعر حجم S
  priceM: numeric("price_m", { precision: 10, scale: 2 }).default("0.00").notNull(), // سعر حجم M
  priceL: numeric("price_l", { precision: 10, scale: 2 }).default("0.00").notNull(), // سعر حجم L
  priceXL: numeric("price_xl", { precision: 10, scale: 2 }).default("0.00").notNull(), // سعر حجم XL
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  inStock: boolean("is_in_stock").default(true).notNull()
});

// جدول المستخدمين
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول التقييمات
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  username: text("username").notNull(), 
  rating: integer("rating").notNull(),   
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول الطلبات (مطور ليشمل ميزات الهدايا، المواعيد، والتوصيل السريع)
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  
  // حقول نظام الهدايا والمستلم الآخر
  isGift: boolean("is_gift").default(false).notNull(),
  recipientName: text("recipient_name").default(""),
  recipientPhone: text("recipient_phone").default(""),
  
  // حقول مواعيد التوصيل المتوقعة
  deliveryDate: text("delivery_date").default(""),
  deliveryTime: text("delivery_time").default(""),
  
  // حقول نوع وتكلفة التوصيل السريع
  deliveryType: text("delivery_type").default("normal").notNull(), // normal or express
  deliveryCost: numeric("delivery_cost", { precision: 10, scale: 2 }).default("0.00").notNull(), // 0.00 أو 2.00
  
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول تفاصيل الطلب
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceAtTime: numeric("price_at_time", { precision: 10, scale: 2 }).notNull(),
  selectedSize: text("selected_size").default("medium").notNull(), // تخزين المقاس المطلوب (s, m, l, xl)
  customNotes: text("custom_notes").default("").notNull(), // حقل كتابة الإضافات أو التعديلات من الزبون
  selectedAddons: text("selected_addons").default("").notNull() // تخزين الإضافات المختارة مثل (شوكولاتة، بالون، فازة) كسلسلة نصية
});

// العلاقات
export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// مخططات التحقق
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, status: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

export const insertReviewSchema = createInsertSchema(reviews, {
  rating: z.number().min(1, "التقييم يجب أن يكون 1 على الأقل").max(5, "التقييم لا يمكن أن يتجاوز 5"),
  comment: z.string().min(3, "التعليق قصير جداً"),
}).omit({ id: true, createdAt: true });

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  phoneNumber: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
}).omit({ id: true, createdAt: true });

// تصدير الأنواع
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// تحديث مخطط الـ Checkout ليشمل حقول الهدايا، التوصيل، الإضافات والتوصيل السريع
export const checkoutSchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerEmail: z.string().email("بريد إلكتروني غير صالح"),
  customerPhone: z.string().min(10, "رقم الهاتف مطلوب (10 أرقام على الأقل)"),
  customerAddress: z.string().min(5, "العنوان مطلوب"),
  
  // التحقق من حقول الهدايا والمواعيد والتوصيل المضافة حديثاً
  isGift: z.boolean().default(false),
  recipientName: z.string().optional().default(""),
  recipientPhone: z.string().optional().default(""),
  deliveryDate: z.string().optional().default(""),
  deliveryTime: z.string().optional().default(""),
  deliveryType: z.string().default("normal"), // normal or express
  deliveryCost: z.string().default("0.00"), // "0.00" أو "2.00"
  
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    selectedSize: z.string().default("medium"),
    customNotes: z.string().default(""),
    selectedAddons: z.string().default("") // استقبال تفاصيل الشوكولاتة والبالونات كـ string
  })).min(1, "السلة فارغة")
});

export type CheckoutRequest = z.infer<typeof checkoutSchema>;