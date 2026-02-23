import { db } from "./db";
import { 
  products, orders, orderItems,
  type Product,
  type Order,
  type CheckoutRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createOrder(checkoutData: CheckoutRequest): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createOrder(checkoutData: CheckoutRequest): Promise<Order> {
    // Transaction to insert order and order items
    return await db.transaction(async (tx) => {
      // 1. Calculate total based on current prices
      let total = 0;
      const orderItemsData: any[] = [];
      
      for (const item of checkoutData.items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!product) throw new Error(`المنتج غير موجود: ${item.productId}`);
        
        const price = Number(product.price);
        total += price * item.quantity;
        
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtTime: price.toString()
        });
      }
      
      // 2. Insert order
      const [order] = await tx.insert(orders).values({
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        customerAddress: checkoutData.customerAddress,
        total: total.toString(),
        status: "pending"
      }).returning();
      
      // 3. Insert order items
      for (const item of orderItemsData) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime
        });
      }
      
      return order;
    });
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
}

export const storage = new DatabaseStorage();
