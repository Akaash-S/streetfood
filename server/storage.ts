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
  getAllProducts(): Promise<any[]>;
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
  
  // Distributor methods
  getWholesaleProductsByDistributorId(distributorId: string): Promise<any[]>;
  createWholesaleProduct(product: any): Promise<any>;
  updateWholesaleProduct(id: string, updates: any): Promise<any>;
  deleteWholesaleProduct(id: string): Promise<boolean>;
  getAllWholesaleProducts(): Promise<any[]>;
  
  getBulkOrdersByDistributorId(distributorId: string): Promise<any[]>;
  getBulkOrdersByShopId(shopId: string): Promise<any[]>;
  createBulkOrder(order: any): Promise<any>;
  updateBulkOrderStatus(orderId: string, status: string): Promise<any>;
  
  getShopDeliveriesByDistributorId(distributorId: string): Promise<any[]>;
  createShopDelivery(delivery: any): Promise<any>;
  updateShopDeliveryStatus(deliveryId: string, status: string): Promise<any>;
}

export class PersistentStorage implements IStorage {
  private users: Map<string, User>;
  private shops: Map<string, RetailShop>;
  private products: Map<string, any>;
  private orders: Map<string, any>;
  private deliveryRequests: Map<string, any>;
  private wholesaleProducts: Map<string, any>;
  private bulkOrders: Map<string, any>;
  private shopDeliveries: Map<string, any>;
  private dataFile = join(process.cwd(), 'data.json');

  constructor() {
    this.users = new Map();
    this.shops = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.deliveryRequests = new Map();
    this.wholesaleProducts = new Map();
    this.bulkOrders = new Map();
    this.shopDeliveries = new Map();
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
        if (data.wholesaleProducts) {
          this.wholesaleProducts = new Map(Object.entries(data.wholesaleProducts));
        }
        if (data.bulkOrders) {
          this.bulkOrders = new Map(Object.entries(data.bulkOrders));
        }
        if (data.shopDeliveries) {
          this.shopDeliveries = new Map(Object.entries(data.shopDeliveries));
        }
        
        console.log(`Loaded ${this.users.size} users, ${this.shops.size} shops, ${this.wholesaleProducts.size} wholesale products from persistent storage`);
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
        wholesaleProducts: Object.fromEntries(this.wholesaleProducts),
        bulkOrders: Object.fromEntries(this.bulkOrders),
        shopDeliveries: Object.fromEntries(this.shopDeliveries),
      };
      writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  private seedData() {
    // Add vendor user if not exists
    const vendorExists = Array.from(this.users.values()).some(user => user.role === 'vendor');
    if (!vendorExists) {
      const vendor: User = {
        id: randomUUID(),
        firebaseUid: 'vendor-dev-uid',
        email: 'vendor@example.com',
        firstName: 'Mike',
        lastName: 'Rodriguez',
        phone: '+1-555-0103',
        role: 'vendor',
        shopName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(vendor.id, vendor);
    }

    // Add shop owners if not exist
    const shopOwner1Exists = Array.from(this.users.values()).some(user => user.firebaseUid === 'shop-owner-uid');
    if (!shopOwner1Exists) {
      const shopOwner1: User = {
        id: 'owner1',
        firebaseUid: 'shop-owner-uid',
        email: 'owner@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1-555-0102',
        role: 'shop_owner',
        shopName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(shopOwner1.id, shopOwner1);

      const shopOwner2: User = {
        id: 'owner2',
        firebaseUid: 'shop-owner-uid-2',
        email: 'owner2@example.com',
        firstName: 'Carlos',
        lastName: 'Martinez',
        phone: '+1-555-0104',
        role: 'shop_owner',
        shopName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(shopOwner2.id, shopOwner2);
    }

    // Seed some sample data for demonstration
    const sampleShops = [
      { id: "shop1", shopName: "Fresh Mart Supplies", address: "Downtown Market", ownerId: "owner1", phone: "+1-555-0101", isActive: true, averageRating: "4.8", createdAt: new Date(), updatedAt: new Date() },
      { id: "shop2", shopName: "Quality Food Store", address: "Central Plaza", ownerId: "owner2", phone: "+1-555-0102", isActive: true, averageRating: "4.6", createdAt: new Date(), updatedAt: new Date() }
    ];

    const sampleProducts = [
      { id: "prod1", shopId: "shop1", name: "Fresh Tomatoes", description: "Organic red tomatoes perfect for street food", price: 3.50, stockQuantity: 100, unit: "kg", isActive: true, shopName: "Fresh Mart Supplies", createdAt: new Date(), updatedAt: new Date() },
      { id: "prod2", shopId: "shop1", name: "Premium Rice", description: "Basmati rice 5kg bag", price: 12.99, stockQuantity: 50, unit: "bags", isActive: true, shopName: "Fresh Mart Supplies", createdAt: new Date(), updatedAt: new Date() },
      { id: "prod3", shopId: "shop1", name: "Onions", description: "Fresh yellow onions", price: 2.25, stockQuantity: 80, unit: "kg", isActive: true, shopName: "Fresh Mart Supplies", createdAt: new Date(), updatedAt: new Date() },
      { id: "prod4", shopId: "shop1", name: "Bell Peppers", description: "Mixed color bell peppers", price: 4.50, stockQuantity: 60, unit: "kg", isActive: true, shopName: "Fresh Mart Supplies", createdAt: new Date(), updatedAt: new Date() },
      { id: "prod5", shopId: "shop2", name: "Cooking Oil", description: "Sunflower oil 1L bottle", price: 4.25, stockQuantity: 75, unit: "bottles", isActive: true, shopName: "Quality Food Store", createdAt: new Date(), updatedAt: new Date() },
      { id: "prod6", shopId: "shop2", name: "Chicken Breast", description: "Fresh chicken breast fillets", price: 8.99, stockQuantity: 25, unit: "kg", isActive: true, shopName: "Quality Food Store", createdAt: new Date(), updatedAt: new Date() },
      { id: "prod7", shopId: "shop2", name: "Bread Rolls", description: "Fresh hamburger buns", price: 1.99, stockQuantity: 120, unit: "packs", isActive: true, shopName: "Quality Food Store", createdAt: new Date(), updatedAt: new Date() },
      { id: "prod8", shopId: "shop2", name: "Cheese Slices", description: "Processed cheese slices", price: 3.49, stockQuantity: 40, unit: "packs", isActive: true, shopName: "Quality Food Store", createdAt: new Date(), updatedAt: new Date() }
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

    // Add distributor user if not exists
    const distributorExists = Array.from(this.users.values()).some(user => user.role === 'distributor');
    if (!distributorExists) {
      const distributor: User = {
        id: randomUUID(),
        firebaseUid: '86FrXYYSpcYgRa8KyV9NSs74HMv1',
        email: 'distributor@premiumfood.com',
        firstName: 'David',
        lastName: 'Smith',
        phone: '+1-555-0101',
        role: 'distributor',
        shopName: 'Premium Food Distributors Inc.',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(distributor.id, distributor);
    }

    // Update existing distributors without shop names
    Array.from(this.users.values()).forEach(user => {
      if (user.role === 'distributor' && !user.shopName) {
        user.shopName = 'Premium Food Distributors Inc.';
        this.users.set(user.id, user);
      }
    });

    // Add sample wholesale products for distributors - use actual distributor user ID
    const distributorUser = Array.from(this.users.values()).find(user => user.role === 'distributor');
    const distributorId = distributorUser ? distributorUser.firebaseUid : "86FrXYYSpcYgRa8KyV9NSs74HMv1";
    
    const sampleWholesaleProducts = [
      { id: "wp1", distributorId, name: "Premium Basmati Rice (25kg)", description: "High-quality basmati rice for bulk orders", category: "Grains", price: 45.99, stockQuantity: 150, unit: "bags", minimumOrderQuantity: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "wp2", distributorId, name: "Cooking Oil Bulk Pack (20L)", description: "Premium cooking oil in bulk packaging", category: "Oils", price: 89.99, stockQuantity: 75, unit: "containers", minimumOrderQuantity: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "wp3", distributorId, name: "Fresh Vegetables Mix (50kg)", description: "Mixed seasonal vegetables in bulk", category: "Vegetables", price: 125.50, stockQuantity: 30, unit: "boxes", minimumOrderQuantity: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "wp4", distributorId, name: "Organic Chicken Breast (15kg)", description: "Fresh organic chicken breast for restaurants", category: "Meat", price: 75.00, stockQuantity: 45, unit: "boxes", minimumOrderQuantity: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "wp5", distributorId, name: "Dairy Milk (50L)", description: "Fresh pasteurized milk in bulk containers", category: "Dairy", price: 65.50, stockQuantity: 85, unit: "containers", minimumOrderQuantity: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "wp6", distributorId, name: "Wheat Flour (30kg)", description: "Premium quality wheat flour for bakeries", category: "Grains", price: 32.99, stockQuantity: 120, unit: "sacks", minimumOrderQuantity: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    const sampleBulkOrders = [
      { id: "bo1", shopId: "shop1", distributorId, orderNumber: "#BLK-12345", status: "processing", totalAmount: 2450.00, deliveryAddress: "Downtown Market", estimatedDeliveryDate: new Date("2025-02-02"), notes: "Urgent delivery needed", createdAt: new Date("2025-01-15"), updatedAt: new Date() },
      { id: "bo2", shopId: "shop2", distributorId, orderNumber: "#BLK-12346", status: "shipped", totalAmount: 1890.75, deliveryAddress: "Central Plaza", estimatedDeliveryDate: new Date("2025-01-30"), notes: "", createdAt: new Date("2025-01-14"), updatedAt: new Date() },
      { id: "bo3", shopId: "shop1", distributorId, orderNumber: "#BLK-12347", status: "pending", totalAmount: 3200.00, deliveryAddress: "Food Street Complex", estimatedDeliveryDate: new Date("2025-02-05"), notes: "Include extra packaging", createdAt: new Date("2025-01-27"), updatedAt: new Date() },
      { id: "bo4", shopId: "shop2", distributorId, orderNumber: "#BLK-12348", status: "delivered", totalAmount: 1250.50, deliveryAddress: "Market Square", estimatedDeliveryDate: new Date("2025-01-28"), notes: "Regular monthly order", createdAt: new Date("2025-01-20"), updatedAt: new Date() }
    ];

    const sampleDeliveries = [
      { id: "sd1", orderId: "bo1", distributorId, shopId: "shop1", driverId: null, vehicleNumber: "TRK-001", status: "scheduled", scheduledDate: new Date("2025-02-02"), deliveredDate: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "sd2", orderId: "bo2", distributorId, shopId: "shop2", driverId: null, vehicleNumber: "TRK-002", status: "in_transit", scheduledDate: new Date("2025-01-30"), deliveredDate: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "sd3", orderId: "bo3", distributorId, shopId: "shop1", driverId: null, vehicleNumber: "TRK-003", status: "scheduled", scheduledDate: new Date("2025-02-05"), deliveredDate: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "sd4", orderId: "bo4", distributorId, shopId: "shop2", driverId: null, vehicleNumber: "TRK-001", status: "delivered", scheduledDate: new Date("2025-01-28"), deliveredDate: new Date("2025-01-28"), createdAt: new Date(), updatedAt: new Date() }
    ];

    sampleWholesaleProducts.forEach(product => this.wholesaleProducts.set(product.id, product));
    sampleBulkOrders.forEach(order => this.bulkOrders.set(order.id, order));
    sampleDeliveries.forEach(delivery => this.shopDeliveries.set(delivery.id, delivery));
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
      shopName: (insertUser as any).shopName || null,
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

  async getAllProducts(): Promise<any[]> {
    return Array.from(this.products.values());
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

  // Distributor methods implementation
  async getWholesaleProductsByDistributorId(distributorId: string): Promise<any[]> {
    return Array.from(this.wholesaleProducts.values()).filter(product => product.distributorId === distributorId);
  }

  async createWholesaleProduct(product: any): Promise<any> {
    const newProduct = {
      ...product,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.wholesaleProducts.set(newProduct.id, newProduct);
    this.saveData();
    return newProduct;
  }

  async updateWholesaleProduct(id: string, updates: any): Promise<any> {
    const product = this.wholesaleProducts.get(id);
    if (!product) return null;
    
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.wholesaleProducts.set(id, updatedProduct);
    this.saveData();
    return updatedProduct;
  }

  async deleteWholesaleProduct(id: string): Promise<boolean> {
    const exists = this.wholesaleProducts.has(id);
    if (exists) {
      this.wholesaleProducts.delete(id);
      this.saveData();
    }
    return exists;
  }

  async getAllWholesaleProducts(): Promise<any[]> {
    return Array.from(this.wholesaleProducts.values());
  }

  async getBulkOrdersByDistributorId(distributorId: string): Promise<any[]> {
    return Array.from(this.bulkOrders.values()).filter(order => order.distributorId === distributorId);
  }

  async getBulkOrdersByShopId(shopId: string): Promise<any[]> {
    return Array.from(this.bulkOrders.values()).filter(order => order.shopId === shopId);
  }

  async createBulkOrder(order: any): Promise<any> {
    const newOrder = {
      ...order,
      id: randomUUID(),
      orderNumber: `#BLK-${Math.floor(Math.random() * 100000)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bulkOrders.set(newOrder.id, newOrder);
    this.saveData();
    return newOrder;
  }

  async updateBulkOrderStatus(orderId: string, status: string): Promise<any> {
    const order = this.bulkOrders.get(orderId);
    if (!order) return null;
    
    const updatedOrder = { ...order, status, updatedAt: new Date() };
    this.bulkOrders.set(orderId, updatedOrder);
    this.saveData();
    return updatedOrder;
  }

  async getShopDeliveriesByDistributorId(distributorId: string): Promise<any[]> {
    return Array.from(this.shopDeliveries.values()).filter(delivery => delivery.distributorId === distributorId);
  }

  async createShopDelivery(delivery: any): Promise<any> {
    const newDelivery = {
      ...delivery,
      id: randomUUID(),
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.shopDeliveries.set(newDelivery.id, newDelivery);
    this.saveData();
    return newDelivery;
  }

  async updateShopDeliveryStatus(deliveryId: string, status: string): Promise<any> {
    const delivery = this.shopDeliveries.get(deliveryId);
    if (!delivery) return null;
    
    const updatedDelivery = { ...delivery, status, updatedAt: new Date() };
    if (status === 'delivered') {
      updatedDelivery.deliveredDate = new Date();
    }
    this.shopDeliveries.set(deliveryId, updatedDelivery);
    this.saveData();
    return updatedDelivery;
  }
}

// Use memory storage for now to ensure reliability
export const storage = new PersistentStorage();
