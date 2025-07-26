import { type User, type InsertUser, type RetailShop, type InsertRetailShop } from "@shared/schema";
import { randomUUID } from "crypto";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// Updated interface with Firebase UID methods and full functionality
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Shop methods
  getShopsByOwnerId(ownerId: string): Promise<RetailShop[]>;
  createRetailShop(shop: InsertRetailShop): Promise<RetailShop>;
  getAllShops(): Promise<RetailShop[]>;

  // Product methods
  getProductsByShopId(shopId: string): Promise<any[]>;
  createProduct(product: any): Promise<any>;
  updateProduct(id: string, updates: any): Promise<any>;

  // Order methods
  getOrdersByVendorId(vendorId: string): Promise<any[]>;
  getOrdersByShopId(shopId: string): Promise<any[]>;
  createOrder(order: any): Promise<any>;
  updateOrderStatus(orderId: string, status: string): Promise<any>;

  // Delivery methods
  getAvailableDeliveryRequests(): Promise<any[]>;
  getDeliveryRequestsByAgentId(agentId: string): Promise<any[]>;
  createDeliveryRequest(request: any): Promise<any>;
  acceptDeliveryRequest(requestId: string, agentId: string): Promise<any>;
}

export class PersistentStorage implements IStorage {
  private users: Map<string, User>;
  private shops: Map<string, RetailShop>;
  private products: Map<string, any>;
  private orders: Map<string, any>;
  private deliveryRequests: Map<string, any>;
  private dataFile = join(process.cwd(), 'data.json');

  constructor() {
    this.users = new Map();
    this.shops = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.deliveryRequests = new Map();
    this.loadData();
    this.seedData();
  }

  private loadData() {
    try {
      if (existsSync(this.dataFile)) {
        const data = JSON.parse(readFileSync(this.dataFile, 'utf8'));
        
        // Restore Maps from saved data
        if (data.users) {
          this.users = new Map(Object.entries(data.users));
        }
        if (data.shops) {
          this.shops = new Map(Object.entries(data.shops));
        }
        if (data.products) {
          this.products = new Map(Object.entries(data.products));
        }
        if (data.orders) {
          this.orders = new Map(Object.entries(data.orders));
        }
        if (data.deliveryRequests) {
          this.deliveryRequests = new Map(Object.entries(data.deliveryRequests));
        }
        
        console.log(`Loaded ${this.users.size} users, ${this.shops.size} shops from persistent storage`);
      }
    } catch (error) {
      console.log('No persistent data found, starting fresh');
    }
  }

  private saveData() {
    try {
      const data = {
        users: Object.fromEntries(this.users),
        shops: Object.fromEntries(this.shops),
        products: Object.fromEntries(this.products),
        orders: Object.fromEntries(this.orders),
        deliveryRequests: Object.fromEntries(this.deliveryRequests),
      };
      writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  private seedData() {
    // Seed some sample data for demonstration
    const sampleShops = [
      { id: "shop1", shopName: "Fresh Mart Supplies", address: "Downtown Market", ownerId: "owner1", phone: "+1-555-0101", isActive: true, averageRating: "4.8", createdAt: new Date(), updatedAt: new Date() },
      { id: "shop2", shopName: "Quality Food Store", address: "Central Plaza", ownerId: "owner2", phone: "+1-555-0102", isActive: true, averageRating: "4.6", createdAt: new Date(), updatedAt: new Date() }
    ];

    const sampleProducts = [
      { id: "prod1", shopId: "shop1", name: "Fresh Tomatoes", description: "Organic tomatoes", price: 3.50, category: "Vegetables", stock: 100, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "prod2", shopId: "shop1", name: "Premium Rice", description: "Basmati rice 5kg", price: 12.99, category: "Grains", stock: 50, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "prod3", shopId: "shop2", name: "Cooking Oil", description: "Sunflower oil 1L", price: 4.25, category: "Oils", stock: 75, isAvailable: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    const sampleOrders = [
      { id: "order1", vendorId: "test123", shopId: "shop1", orderNumber: "#12345", status: "delivered", total: 234.50, items: [{ productId: "prod1", quantity: 20, price: 3.50 }], createdAt: new Date("2024-12-15"), updatedAt: new Date() },
      { id: "order2", vendorId: "test123", shopId: "shop2", orderNumber: "#12344", status: "in_transit", total: 189.25, items: [{ productId: "prod3", quantity: 10, price: 4.25 }], createdAt: new Date("2024-12-14"), updatedAt: new Date() }
    ];

    const sampleDeliveryRequests = [
      { id: "del1", orderId: "order2", route: "Quality Food Store → John's Food Cart", distance: "1.8 km", estimatedTime: "12 mins", fee: 9.75, status: "available", agentId: null, createdAt: new Date(), updatedAt: new Date() }
    ];

    sampleShops.forEach(shop => this.shops.set(shop.id, shop));
    sampleProducts.forEach(product => this.products.set(product.id, product));
    sampleOrders.forEach(order => this.orders.set(order.id, order));
    sampleDeliveryRequests.forEach(request => this.deliveryRequests.set(request.id, request));
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
    this.saveData(); // Persist after changes
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
    this.saveData(); // Persist after changes
    return shop;
  }

  async getAllShops(): Promise<RetailShop[]> {
    return Array.from(this.shops.values());
  }

  // Product methods
  async getProductsByShopId(shopId: string): Promise<any[]> {
    return Array.from(this.products.values()).filter(product => product.shopId === shopId);
  }

  async createProduct(product: any): Promise<any> {
    const newProduct = {
      ...product,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(newProduct.id, newProduct);
    this.saveData();
    return newProduct;
  }

  async updateProduct(id: string, updates: any): Promise<any> {
    const product = this.products.get(id);
    if (!product) return null;
    
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    this.saveData();
    return updatedProduct;
  }

  // Order methods
  async getOrdersByVendorId(vendorId: string): Promise<any[]> {
    return Array.from(this.orders.values()).filter(order => order.vendorId === vendorId);
  }

  async getOrdersByShopId(shopId: string): Promise<any[]> {
    return Array.from(this.orders.values()).filter(order => order.shopId === shopId);
  }

  async createOrder(order: any): Promise<any> {
    const newOrder = {
      ...order,
      id: randomUUID(),
      orderNumber: `#${Math.floor(Math.random() * 100000)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(newOrder.id, newOrder);
    this.saveData();
    return newOrder;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const order = this.orders.get(orderId);
    if (!order) return null;
    
    const updatedOrder = { ...order, status, updatedAt: new Date() };
    this.orders.set(orderId, updatedOrder);
    this.saveData();
    return updatedOrder;
  }

  // Delivery methods
  async getAvailableDeliveryRequests(): Promise<any[]> {
    return Array.from(this.deliveryRequests.values()).filter(request => request.status === 'available');
  }

  async getDeliveryRequestsByAgentId(agentId: string): Promise<any[]> {
    return Array.from(this.deliveryRequests.values()).filter(request => request.agentId === agentId);
  }

  async createDeliveryRequest(request: any): Promise<any> {
    const newRequest = {
      ...request,
      id: randomUUID(),
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deliveryRequests.set(newRequest.id, newRequest);
    this.saveData();
    return newRequest;
  }

  async acceptDeliveryRequest(requestId: string, agentId: string): Promise<any> {
    const request = this.deliveryRequests.get(requestId);
    if (!request) return null;
    
    const updatedRequest = { ...request, agentId, status: 'accepted', updatedAt: new Date() };
    this.deliveryRequests.set(requestId, updatedRequest);
    this.saveData();
    return updatedRequest;
  }
}

// Use memory storage for now to ensure reliability
export const storage = new PersistentStorage();
