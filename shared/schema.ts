import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull(), // 'street_vendor', 'delivery_agent', 'distributor'
  companyName: text("company_name"), // For distributors, this stores their distribution company name
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Distributor wholesale products
export const wholesaleProducts = pgTable("wholesale_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  distributorId: varchar("distributor_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").default(0),
  unit: text("unit").notNull(), // 'kg', 'pieces', 'liters', etc.
  minimumOrderQuantity: integer("minimum_order_quantity").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Street vendor orders from distributors
export const vendorOrders = pgTable("vendor_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => users.id).notNull(),
  distributorId: varchar("distributor_id").references(() => users.id).notNull(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorOrderItems = pgTable("vendor_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => vendorOrders.id).notNull(),
  productId: varchar("product_id").references(() => wholesaleProducts.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Delivery assignments for street vendor orders
export const deliveryAssignments = pgTable("delivery_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => vendorOrders.id).notNull(),
  agentId: varchar("agent_id").references(() => users.id),
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  status: text("status").notNull().default("available"), // 'available', 'assigned', 'picked_up', 'in_transit', 'delivered', 'completed'
  paymentMethod: text("payment_method").notNull().default("cash_on_delivery"), // 'cash_on_delivery', 'digital_payment'
  paymentStatus: text("payment_status").notNull().default("pending"), // 'pending', 'paid', 'failed'
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  estimatedDistance: decimal("estimated_distance", { precision: 5, scale: 2 }), // in kilometers
  estimatedTime: integer("estimated_time"), // in minutes
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }),
  deliveryLatitude: decimal("delivery_latitude", { precision: 10, scale: 8 }),
  deliveryLongitude: decimal("delivery_longitude", { precision: 11, scale: 8 }),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWholesaleProductSchema = createInsertSchema(wholesaleProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorOrderSchema = createInsertSchema(vendorOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorOrderItemSchema = createInsertSchema(vendorOrderItems).omit({
  id: true,
});

export const insertDeliveryAssignmentSchema = createInsertSchema(deliveryAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWholesaleProduct = z.infer<typeof insertWholesaleProductSchema>;
export type WholesaleProduct = typeof wholesaleProducts.$inferSelect;
export type InsertVendorOrder = z.infer<typeof insertVendorOrderSchema>;
export type VendorOrder = typeof vendorOrders.$inferSelect;
export type InsertVendorOrderItem = z.infer<typeof insertVendorOrderItemSchema>;
export type VendorOrderItem = typeof vendorOrderItems.$inferSelect;
export type InsertDeliveryAssignment = z.infer<typeof insertDeliveryAssignmentSchema>;
export type DeliveryAssignment = typeof deliveryAssignments.$inferSelect;