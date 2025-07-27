import { 
  type User, 
  type InsertUser, 
  type RetailShop, 
  type InsertRetailShop,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type WholesaleProduct,
  type InsertWholesaleProduct,
  type BulkOrder,
  type InsertBulkOrder,
  type ShopDelivery,
  type InsertShopDelivery,
  type DeliveryRequest,
  type InsertDeliveryRequest,
  users,
  retailShops,
  products,
  orders,
  orderItems,
  wholesaleProducts,
  bulkOrders,
  bulkOrderItems,
  shopDeliveries,
  deliveryRequests
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize and seed data on startup
    this.initializeData();
  }

  private async initializeData() {
    try {
      await this.seedData();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }

  private async seedData() {
    try {
      // Check if we already have data
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        console.log('Database already has data, skipping seed');
        return;
      }

      console.log('Seeding database with initial data...');

      // Create users
      const vendorUser = await db.insert(users).values({
        firebaseUid: 'vendor-dev-uid',
        email: 'vendor@example.com',
        firstName: 'Mike',
        lastName: 'Rodriguez',
        phone: '+1-555-0103',
        role: 'vendor',
      }).returning();

      const shopOwner1 = await db.insert(users).values({
        firebaseUid: 'shop-owner-uid',
        email: 'owner@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1-555-0102',
        role: 'shop_owner',
      }).returning();

      const shopOwner2 = await db.insert(users).values({
        firebaseUid: 'shop-owner-uid-2',
        email: 'owner2@example.com',
        firstName: 'Carlos',
        lastName: 'Martinez',
        phone: '+1-555-0104',
        role: 'shop_owner',
      }).returning();

      const distributorUser = await db.insert(users).values({
        firebaseUid: '86FrXYYSpcYgRa8KyV9NSs74HMv1',
        email: 'distributor@premiumfood.com',
        firstName: 'David',
        lastName: 'Smith',
        phone: '+1-555-0101',
        role: 'distributor',
        shopName: 'Premium Food Distributors Inc.',
      }).returning();

      // Create retail shops
      const shop1 = await db.insert(retailShops).values({
        ownerId: shopOwner1[0].id,
        shopName: 'Fresh Mart Supplies',
        address: 'Downtown Market',
        phone: '+1-555-0101',
        isActive: true,
        averageRating: '4.8',
      }).returning();

      const shop2 = await db.insert(retailShops).values({
        ownerId: shopOwner2[0].id,
        shopName: 'Quality Food Store',
        address: 'Central Plaza',
        phone: '+1-555-0102',
        isActive: true,
        averageRating: '4.6',
      }).returning();

      // Create products
      await db.insert(products).values([
        {
          shopId: shop1[0].id,
          name: 'Fresh Tomatoes',
          description: 'Organic red tomatoes perfect for street food',
          price: '3.50',
          stockQuantity: 100,
          unit: 'kg',
          isActive: true,
        },
        {
          shopId: shop1[0].id,
          name: 'Premium Rice',
          description: 'Basmati rice 5kg bag',
          price: '12.99',
          stockQuantity: 50,
          unit: 'bags',
          isActive: true,
        },
        {
          shopId: shop2[0].id,
          name: 'Cooking Oil',
          description: 'Sunflower oil 1L bottle',
          price: '4.25',
          stockQuantity: 75,
          unit: 'bottles',
          isActive: true,
        },
        {
          shopId: shop2[0].id,
          name: 'Chicken Breast',
          description: 'Fresh chicken breast fillets',
          price: '8.99',
          stockQuantity: 25,
          unit: 'kg',
          isActive: true,
        },
      ]);

      // Create wholesale products
      await db.insert(wholesaleProducts).values([
        {
          distributorId: distributorUser[0].firebaseUid,
          name: 'Premium Basmati Rice (25kg)',
          description: 'High-quality basmati rice for bulk orders',
          category: 'Grains',
          price: '45.99',
          stockQuantity: 150,
          unit: 'bags',
          minimumOrderQuantity: 5,
          isActive: true,
        },
        {
          distributorId: distributorUser[0].firebaseUid,
          name: 'Cooking Oil Bulk Pack (20L)',
          description: 'Premium cooking oil in bulk packaging',
          category: 'Oils',
          price: '89.99',
          stockQuantity: 75,
          unit: 'containers',
          minimumOrderQuantity: 2,
          isActive: true,
        },
        {
          distributorId: distributorUser[0].firebaseUid,
          name: 'Fresh Vegetables Mix (50kg)',
          description: 'Mixed seasonal vegetables in bulk',
          category: 'Vegetables',
          price: '125.50',
          stockQuantity: 30,
          unit: 'boxes',
          minimumOrderQuantity: 1,
          isActive: true,
        },
      ]);

      // Create bulk orders
      await db.insert(bulkOrders).values([
        {
          shopId: shop1[0].id,
          distributorId: distributorUser[0].firebaseUid,
          orderNumber: '#BLK-12345',
          status: 'processing',
          totalAmount: '2450.00',
          deliveryAddress: 'Downtown Market',
          estimatedDeliveryDate: new Date('2025-02-02'),
          notes: 'Urgent delivery needed',
        },
        {
          shopId: shop2[0].id,
          distributorId: distributorUser[0].firebaseUid,
          orderNumber: '#BLK-12346',
          status: 'shipped',
          totalAmount: '1890.75',
          deliveryAddress: 'Central Plaza',
          estimatedDeliveryDate: new Date('2025-01-30'),
          notes: '',
        },
      ]);

      console.log('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getShopsByOwnerId(ownerId: string): Promise<RetailShop[]> {
    return await db.select().from(retailShops).where(eq(retailShops.ownerId, ownerId));
  }

  async createRetailShop(shop: InsertRetailShop): Promise<RetailShop> {
    const [newShop] = await db.insert(retailShops).values(shop).returning();
    return newShop;
  }

  async getAllShops(): Promise<RetailShop[]> {
    return await db.select().from(retailShops);
  }

  async getProductsByShopId(shopId: string): Promise<any[]> {
    return await db.select().from(products).where(eq(products.shopId, shopId));
  }

  async getAllProducts(): Promise<any[]> {
    return await db.select().from(products);
  }

  async createProduct(product: any): Promise<any> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: any): Promise<any> {
    const [updatedProduct] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updatedProduct;
  }

  async getOrdersByVendorId(vendorId: string): Promise<any[]> {
    return await db.select().from(orders).where(eq(orders.vendorId, vendorId));
  }

  async getOrdersByShopId(shopId: string): Promise<any[]> {
    return await db.select().from(orders).where(eq(orders.shopId, shopId));
  }

  async createOrder(order: any): Promise<any> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const [updatedOrder] = await db.update(orders).set({ status }).where(eq(orders.id, orderId)).returning();
    return updatedOrder;
  }

  async getAvailableDeliveryRequests(): Promise<any[]> {
    return await db.select().from(deliveryRequests).where(eq(deliveryRequests.status, 'available'));
  }

  async getDeliveryRequestsByAgentId(agentId: string): Promise<any[]> {
    return await db.select().from(deliveryRequests).where(eq(deliveryRequests.agentId, agentId));
  }

  async createDeliveryRequest(request: any): Promise<any> {
    const [newRequest] = await db.insert(deliveryRequests).values(request).returning();
    return newRequest;
  }

  async acceptDeliveryRequest(requestId: string, agentId: string): Promise<any> {
    const [updatedRequest] = await db.update(deliveryRequests)
      .set({ agentId, status: 'accepted' })
      .where(eq(deliveryRequests.id, requestId))
      .returning();
    return updatedRequest;
  }

  async getWholesaleProductsByDistributorId(firebaseUid: string): Promise<any[]> {
    // First get the user's database ID from their Firebase UID
    const user = await this.getUserByFirebaseUid(firebaseUid);
    if (!user) return [];
    
    return await db.select().from(wholesaleProducts).where(eq(wholesaleProducts.distributorId, user.id));
  }

  async createWholesaleProduct(product: any): Promise<any> {
    const [newProduct] = await db.insert(wholesaleProducts).values(product).returning();
    return newProduct;
  }

  async updateWholesaleProduct(id: string, updates: any): Promise<any> {
    const [updatedProduct] = await db.update(wholesaleProducts).set(updates).where(eq(wholesaleProducts.id, id)).returning();
    return updatedProduct;
  }

  async deleteWholesaleProduct(id: string): Promise<boolean> {
    const result = await db.delete(wholesaleProducts).where(eq(wholesaleProducts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllWholesaleProducts(): Promise<any[]> {
    return await db.select().from(wholesaleProducts);
  }

  async getBulkOrdersByDistributorId(distributorId: string): Promise<any[]> {
    return await db.select().from(bulkOrders).where(eq(bulkOrders.distributorId, distributorId));
  }

  async getBulkOrdersByShopId(shopId: string): Promise<any[]> {
    return await db.select().from(bulkOrders).where(eq(bulkOrders.shopId, shopId));
  }

  async createBulkOrder(order: any): Promise<any> {
    const [newOrder] = await db.insert(bulkOrders).values(order).returning();
    return newOrder;
  }

  async updateBulkOrderStatus(orderId: string, status: string): Promise<any> {
    const [updatedOrder] = await db.update(bulkOrders).set({ status }).where(eq(bulkOrders.id, orderId)).returning();
    return updatedOrder;
  }

  async getShopDeliveriesByDistributorId(distributorId: string): Promise<any[]> {
    return await db.select().from(shopDeliveries).where(eq(shopDeliveries.distributorId, distributorId));
  }

  async createShopDelivery(delivery: any): Promise<any> {
    const [newDelivery] = await db.insert(shopDeliveries).values(delivery).returning();
    return newDelivery;
  }

  async updateShopDeliveryStatus(deliveryId: string, status: string): Promise<any> {
    const [updatedDelivery] = await db.update(shopDeliveries).set({ status }).where(eq(shopDeliveries.id, deliveryId)).returning();
    return updatedDelivery;
  }
}

export const storage = new DatabaseStorage();