import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  products, orders, orderItems, users, reviews,
  type Product,
  type Order,
  type CheckoutRequest,
  type User,
  type InsertUser,
  type Review,
  type InsertReview
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: any): Promise<Product>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  createOrder(checkoutData: CheckoutRequest): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<void>;
  updateUserRole(id: number, role: string): Promise<User>;
  getReviewsByProduct(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: any): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  // تحديث المنتج: يدعم تعديل أي حقل يصل من الفرونت إند (اسم، سعر، وصف، صورة)
  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({ ...insertUser, password: hashedPassword }).returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    const [updatedUser] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async createOrder(checkoutData: CheckoutRequest): Promise<Order> {
    return await db.transaction(async (tx) => {
      let total = 0;
      const [order] = await tx.insert(orders).values({
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        customerPhone: checkoutData.customerPhone,
        customerAddress: checkoutData.customerAddress,
        total: "0",
        status: "pending"
      }).returning();
      
      for (const item of checkoutData.items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (product) {
          total += Number(product.price) * item.quantity;
          await tx.insert(orderItems).values({
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity,
            priceAtTime: product.price.toString()
          });
        }
      }
      const [updatedOrder] = await tx.update(orders).set({ total: total.toString() }).where(eq(orders.id, order.id)).returning();
      return updatedOrder;
    });
  }

  async getOrders(): Promise<Order[]> {
  // 1. جلب جميع الطلبات الأساسية
  const allOrders = await db.select().from(orders);
  
  // 2. دمج المنتجات الخاصة بكل طلب تلقائياً
  const ordersWithItems = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
        
      return {
        ...order,
        items: items // إرفاق مصفوفة المنتجات هنا لتقرأها لوحة التحكم
      };
    })
  );
  
  return ordersWithItems as any;
}

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updatedOrder;
  }
}

export const storage = new DatabaseStorage();