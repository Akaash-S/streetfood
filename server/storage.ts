import { 
  type User, 
  type InsertUser, 
  type WholesaleProduct,
  type InsertWholesaleProduct,
  type VendorOrder,
  type InsertVendorOrder,
  type VendorOrderItem,
  type InsertVendorOrderItem,
  type DeliveryAssignment,
  type InsertDeliveryAssignment,
  users,
  wholesaleProducts,
  vendorOrders,
  vendorOrderItems,
  deliveryAssignments
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, inArray } from "drizzle-orm";

// Updated interface for simplified three-role system
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Distributor methods (wholesale products)
  getWholesaleProductsByDistributorId(firebaseUid: string): Promise<WholesaleProduct[]>;
  createWholesaleProduct(product: InsertWholesaleProduct): Promise<WholesaleProduct>;
  updateWholesaleProduct(id: string, updates: Partial<WholesaleProduct>): Promise<WholesaleProduct>;
  deleteWholesaleProduct(id: string): Promise<boolean>;
  getAllWholesaleProducts(): Promise<WholesaleProduct[]>;
  getAllDistributors(): Promise<User[]>;
  getProductsByDistributorId(distributorId: string): Promise<WholesaleProduct[]>;
  
  // Street vendor methods (orders)
  getVendorOrdersByVendorId(firebaseUid: string): Promise<VendorOrder[]>;
  getVendorOrdersByDistributorId(firebaseUid: string): Promise<VendorOrder[]>;
  createVendorOrder(order: InsertVendorOrder, items: InsertVendorOrderItem[]): Promise<VendorOrder>;
  updateVendorOrderStatus(orderId: string, status: string): Promise<VendorOrder>;
  getVendorOrderItems(orderId: string): Promise<VendorOrderItem[]>;
  
  // Delivery agent methods
  getAvailableDeliveryAssignments(): Promise<DeliveryAssignment[]>;
  getDeliveryAssignmentsByAgentId(firebaseUid: string): Promise<DeliveryAssignment[]>;
  getDeliveryAssignmentsByDistributorId(firebaseUid: string): Promise<DeliveryAssignment[]>;
  createDeliveryAssignment(assignment: InsertDeliveryAssignment): Promise<DeliveryAssignment>;
  createDeliveryAssignmentForOrder(orderId: string, distributorFirebaseUid: string): Promise<DeliveryAssignment>;
  acceptDeliveryAssignment(assignmentId: string, agentFirebaseUid: string): Promise<DeliveryAssignment>;
  updateDeliveryAssignmentStatus(assignmentId: string, status: string): Promise<DeliveryAssignment>;
  updateDeliveryLocation(assignmentId: string, latitude: number, longitude: number): Promise<DeliveryAssignment>;
  completeDeliveryWithPayment(assignmentId: string, paymentStatus: string, notes?: string): Promise<DeliveryAssignment>;
  getDeliveryTrackingInfo(assignmentId: string): Promise<DeliveryAssignment | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // No seeding - clean database as requested
    console.log('DatabaseStorage initialized with clean data (no mock/demo data)');
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

  // Distributor wholesale product methods
  async getWholesaleProductsByDistributorId(firebaseUid: string): Promise<WholesaleProduct[]> {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    if (!user) return [];
    
    return await db.select().from(wholesaleProducts).where(eq(wholesaleProducts.distributorId, user.id));
  }

  async createWholesaleProduct(product: InsertWholesaleProduct): Promise<WholesaleProduct> {
    const [newProduct] = await db.insert(wholesaleProducts).values(product).returning();
    return newProduct;
  }

  async updateWholesaleProduct(id: string, updates: Partial<WholesaleProduct>): Promise<WholesaleProduct> {
    const [updatedProduct] = await db.update(wholesaleProducts).set(updates).where(eq(wholesaleProducts.id, id)).returning();
    return updatedProduct;
  }

  async deleteWholesaleProduct(id: string): Promise<boolean> {
    const result = await db.delete(wholesaleProducts).where(eq(wholesaleProducts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllWholesaleProducts(): Promise<WholesaleProduct[]> {
    return await db.select().from(wholesaleProducts);
  }

  async getAllDistributors(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'distributor'));
  }

  async getProductsByDistributorId(distributorId: string): Promise<WholesaleProduct[]> {
    return await db.select().from(wholesaleProducts).where(eq(wholesaleProducts.distributorId, distributorId));
  }

  // Street vendor order methods
  async getVendorOrdersByVendorId(firebaseUid: string): Promise<VendorOrder[]> {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    if (!user) return [];
    
    return await db.select().from(vendorOrders).where(eq(vendorOrders.vendorId, user.id));
  }

  async getVendorOrdersByDistributorId(firebaseUid: string): Promise<VendorOrder[]> {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    if (!user) return [];
    
    return await db.select().from(vendorOrders).where(eq(vendorOrders.distributorId, user.id));
  }

  async createVendorOrder(order: InsertVendorOrder, items: InsertVendorOrderItem[]): Promise<VendorOrder> {
    const [newOrder] = await db.insert(vendorOrders).values(order).returning();
    
    // Insert order items
    if (items.length > 0) {
      const orderItemsWithOrderId = items.map(item => ({
        ...item,
        orderId: newOrder.id
      }));
      await db.insert(vendorOrderItems).values(orderItemsWithOrderId);
    }
    
    return newOrder;
  }

  async getVendorOrderItems(orderId: string): Promise<VendorOrderItem[]> {
    return await db.select().from(vendorOrderItems).where(eq(vendorOrderItems.orderId, orderId));
  }

  async updateVendorOrderStatus(orderId: string, status: string): Promise<VendorOrder> {
    const [updatedOrder] = await db.update(vendorOrders).set({ status }).where(eq(vendorOrders.id, orderId)).returning();
    return updatedOrder;
  }

  // Delivery assignment methods
  async getAvailableDeliveryAssignments(): Promise<DeliveryAssignment[]> {
    return await db.select().from(deliveryAssignments).where(eq(deliveryAssignments.status, 'available'));
  }

  async getDeliveryAssignmentsByAgentId(firebaseUid: string): Promise<DeliveryAssignment[]> {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    if (!user) return [];
    
    return await db.select().from(deliveryAssignments).where(eq(deliveryAssignments.agentId, user.id));
  }

  async createDeliveryAssignment(assignment: InsertDeliveryAssignment): Promise<DeliveryAssignment> {
    const [newAssignment] = await db.insert(deliveryAssignments).values(assignment).returning();
    return newAssignment;
  }

  async acceptDeliveryAssignment(assignmentId: string, agentFirebaseUid: string): Promise<DeliveryAssignment> {
    const agent = await this.getUserByFirebaseUid(agentFirebaseUid);
    if (!agent) throw new Error('Agent not found');
    
    const [updatedAssignment] = await db.update(deliveryAssignments)
      .set({ agentId: agent.id, status: 'assigned' })
      .where(eq(deliveryAssignments.id, assignmentId))
      .returning();
    return updatedAssignment;
  }

  async updateDeliveryAssignmentStatus(assignmentId: string, status: string): Promise<DeliveryAssignment> {
    const [updatedAssignment] = await db.update(deliveryAssignments).set({ status }).where(eq(deliveryAssignments.id, assignmentId)).returning();
    return updatedAssignment;
  }

  // Distributor-specific delivery methods
  async getDeliveryAssignmentsByDistributorId(firebaseUid: string): Promise<DeliveryAssignment[]> {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    if (!user) return [];
    
    // Get all delivery assignments for orders placed with this distributor
    const distributorOrders = await db.select().from(vendorOrders).where(eq(vendorOrders.distributorId, user.id));
    const orderIds = distributorOrders.map(order => order.id);
    
    if (orderIds.length === 0) return [];
    
    return await db.select().from(deliveryAssignments).where(
      inArray(deliveryAssignments.orderId, orderIds)
    );
  }

  async createDeliveryAssignmentForOrder(orderId: string, distributorFirebaseUid: string): Promise<DeliveryAssignment> {
    const distributor = await this.getUserByFirebaseUid(distributorFirebaseUid);
    if (!distributor) throw new Error('Distributor not found');
    
    // Get the order details
    const [order] = await db.select().from(vendorOrders).where(eq(vendorOrders.id, orderId));
    if (!order) throw new Error('Order not found');
    
    // Create delivery assignment with enhanced features
    const assignmentData = {
      orderId: orderId,
      pickupAddress: distributor.companyName || 'Distributor Warehouse',
      deliveryAddress: order.deliveryAddress,
      status: 'available',
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      deliveryFee: '50.00', // Default delivery fee
      estimatedDistance: '5.0', // Default 5km
      estimatedTime: 30, // Default 30 minutes
      // Default coordinates (can be updated when agent accepts)
      pickupLatitude: '40.7128',
      pickupLongitude: '-74.0060',
      deliveryLatitude: '40.7589',
      deliveryLongitude: '-73.9851',
    };
    
    const [newAssignment] = await db.insert(deliveryAssignments).values(assignmentData).returning();
    return newAssignment;
  }

  async updateDeliveryLocation(assignmentId: string, latitude: number, longitude: number): Promise<DeliveryAssignment> {
    const [updatedAssignment] = await db.update(deliveryAssignments)
      .set({ 
        currentLatitude: String(latitude), 
        currentLongitude: String(longitude),
        updatedAt: new Date()
      })
      .where(eq(deliveryAssignments.id, assignmentId))
      .returning();
    return updatedAssignment;
  }

  async completeDeliveryWithPayment(assignmentId: string, paymentStatus: string, notes?: string): Promise<DeliveryAssignment> {
    const [updatedAssignment] = await db.update(deliveryAssignments)
      .set({ 
        status: 'completed',
        paymentStatus: paymentStatus,
        actualDeliveryTime: new Date(),
        notes: notes || null,
        updatedAt: new Date()
      })
      .where(eq(deliveryAssignments.id, assignmentId))
      .returning();
    return updatedAssignment;
  }

  async getDeliveryTrackingInfo(assignmentId: string): Promise<DeliveryAssignment | undefined> {
    const [assignment] = await db.select().from(deliveryAssignments).where(eq(deliveryAssignments.id, assignmentId));
    return assignment;
  }
}

export const storage = new DatabaseStorage();