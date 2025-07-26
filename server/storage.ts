import { type User, type InsertUser, type RetailShop, type InsertRetailShop } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

// Updated interface with Firebase UID methods
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Placeholder methods for future implementation
  getShopsByOwnerId(ownerId: string): Promise<RetailShop[]>;
  createRetailShop(shop: InsertRetailShop): Promise<RetailShop>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private shops: Map<string, RetailShop>;

  constructor() {
    this.users = new Map();
    this.shops = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      phone: insertUser.phone || null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getShopsByOwnerId(ownerId: string): Promise<RetailShop[]> {
    return Array.from(this.shops.values()).filter(
      (shop) => shop.ownerId === ownerId,
    );
  }

  async createRetailShop(insertShop: InsertRetailShop): Promise<RetailShop> {
    const id = randomUUID();
    const now = new Date();
    const shop: RetailShop = {
      ...insertShop,
      id,
      phone: insertShop.phone || null,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      averageRating: "0.00",
    };
    this.shops.set(id, shop);
    return shop;
  }
}

// Database storage implementation
class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sql = postgres(process.env.DATABASE_URL!);
    this.db = drizzle(sql, { schema });
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.firebaseUid, firebaseUid)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(schema.users).values(insertUser).returning();
    return result[0];
  }

  async getShopsByOwnerId(ownerId: string): Promise<RetailShop[]> {
    return await this.db.select().from(schema.retailShops).where(eq(schema.retailShops.ownerId, ownerId));
  }

  async createRetailShop(insertShop: InsertRetailShop): Promise<RetailShop> {
    const result = await this.db.insert(schema.retailShops).values(insertShop).returning();
    return result[0];
  }
}

// Use database storage if DATABASE_URL is available, otherwise use memory storage
export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
