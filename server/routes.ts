import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWholesaleProductSchema } from "@shared/schema";
import admin from "firebase-admin";

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    // Continue without Firebase Admin for now
  }
}

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Development fallback - allow test-token for testing
    if (token === 'test-token') {
      req.user = { 
        uid: '86FrXYYSpcYgRa8KyV9NSs74HMv1',
        email: 'distributor@premiumfood.com' 
      } as any;
      return next();
    }
    
    // Verify token with Firebase Admin SDK
    try {
      if (admin.apps.length > 0) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        return next();
      } else {
        // Fallback for development: decode token payload
        try {
          const parts = token.split('.');
          if (parts.length !== 3) {
            throw new Error('Invalid token format');
          }
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          req.user = { 
            uid: payload.user_id || payload.sub || payload.uid,
            email: payload.email 
          } as any;
          return next();
        } catch (decodeError) {
          return res.status(401).json({ message: 'Invalid token' });
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Token verification failed' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

export function registerRoutes(app: Express): Server {
  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByFirebaseUid(validatedData.firebaseUid);
      if (existingUser) {
        return res.json(existingUser);
      }

      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Get current user info
  app.get("/api/users/me", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log("Getting user for UID:", req.user!.uid);
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("User found:", user);
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Distributor routes - Wholesale product management
  app.get("/api/distributor/products", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const products = await storage.getWholesaleProductsByDistributorId(req.user!.uid);
      res.json(products);
    } catch (error) {
      console.error('Get distributor products error:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/distributor/products", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Verify user is a distributor
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role !== 'distributor') {
        return res.status(403).json({ message: "Access denied. Distributor role required." });
      }

      // Manual data transformation to ensure proper types
      const productData = {
        distributorId: user.id,
        name: req.body.name,
        description: req.body.description || null,
        category: req.body.category,
        price: String(req.body.price), // Convert to string for decimal field
        stockQuantity: parseInt(req.body.stockQuantity) || 0,
        unit: req.body.unit,
        minimumOrderQuantity: parseInt(req.body.minimumOrderQuantity) || 1,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      };
      
      console.log("Creating product with processed data:", productData);
      const product = await storage.createWholesaleProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/distributor/products/:id", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const product = await storage.updateWholesaleProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/distributor/products/:id", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const success = await storage.deleteWholesaleProduct(req.params.id);
      if (success) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

  // Distributor orders (vendor orders to distributor)
  app.get("/api/distributor/orders", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const orders = await storage.getVendorOrdersByDistributorId(req.user!.uid);
      res.json(orders);
    } catch (error) {
      console.error('Get distributor orders error:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get order items for a specific order (for distributor to see details)
  app.get("/api/distributor/orders/:orderId/items", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId } = req.params;
      const items = await storage.getVendorOrderItems(orderId);
      res.json(items);
    } catch (error) {
      console.error('Get order items error:', error);
      res.status(500).json({ message: "Failed to fetch order items" });
    }
  });

  // Update distributor order status  
  app.patch("/api/distributor/orders/:id", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user || user.role !== 'distributor') {
        return res.status(403).json({ message: "Access denied. Distributor role required." });
      }

      const { id } = req.params;
      const { status } = req.body;

      const order = await storage.updateVendorOrderStatus(id, status);
      
      // Auto-create delivery assignment when order is shipped
      if (status === 'shipped') {
        try {
          await storage.createDeliveryAssignmentForOrder(id, req.user!.uid);
        } catch (deliveryError) {
          console.log('Delivery assignment already exists or failed to create:', deliveryError);
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  // Distributor deliveries
  app.get("/api/distributor/deliveries", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deliveries = await storage.getDeliveryAssignmentsByDistributorId(req.user!.uid);
      res.json(deliveries);
    } catch (error) {
      console.error('Get deliveries error:', error);
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  // Create delivery assignment for an order
  app.post("/api/distributor/deliveries", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user || user.role !== 'distributor') {
        return res.status(403).json({ message: "Access denied. Distributor role required." });
      }

      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      const delivery = await storage.createDeliveryAssignmentForOrder(orderId, req.user!.uid);
      res.status(201).json(delivery);
    } catch (error) {
      console.error('Create delivery assignment error:', error);
      res.status(400).json({ message: "Failed to create delivery assignment" });
    }
  });

  // Update delivery assignment status
  app.patch("/api/distributor/deliveries/:id", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user || user.role !== 'distributor') {
        return res.status(403).json({ message: "Access denied. Distributor role required." });
      }

      const { id } = req.params;
      const { status } = req.body;

      const delivery = await storage.updateDeliveryAssignmentStatus(id, status);
      res.json(delivery);
    } catch (error) {
      console.error('Update delivery assignment error:', error);
      res.status(400).json({ message: "Failed to update delivery assignment" });
    }
  });

  // Street vendor routes
  // Get all distributors (shops) for vendor to browse
  app.get("/api/vendor/distributors", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const distributors = await storage.getAllDistributors();
      res.json(distributors);
    } catch (error) {
      console.error('Get distributors error:', error);
      res.status(500).json({ message: "Failed to fetch distributors" });
    }
  });

  // Get products by distributor ID for vendor to browse
  app.get("/api/vendor/products/:distributorId", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { distributorId } = req.params;
      const products = await storage.getProductsByDistributorId(distributorId);
      res.json(products);
    } catch (error) {
      console.error('Get vendor products error:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/vendor/products", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const products = await storage.getAllWholesaleProducts();
      res.json(products);
    } catch (error) {
      console.error('Get vendor products error:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/vendor/orders", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const orders = await storage.getVendorOrdersByVendorId(req.user!.uid);
      res.json(orders);
    } catch (error) {
      console.error('Get vendor orders error:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Create vendor order
  app.post("/api/vendor/orders", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role !== 'street_vendor') {
        return res.status(403).json({ message: "Access denied. Street vendor role required." });
      }

      const { distributorId, totalAmount, deliveryAddress, items, notes } = req.body;
      
      // Generate unique order number
      const orderNumber = `VO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const orderData = {
        vendorId: user.id,
        distributorId,
        orderNumber,
        totalAmount: String(totalAmount), // Convert to string for decimal field
        deliveryAddress,
        notes: notes || null,
        status: 'pending'
      };
      
      const order = await storage.createVendorOrder(orderData, items || []);
      res.status(201).json(order);
    } catch (error) {
      console.error('Create vendor order error:', error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  // Delivery agent routes
  app.get("/api/agent/deliveries", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deliveries = await storage.getAvailableDeliveryAssignments();
      res.json(deliveries);
    } catch (error) {
      console.error('Get agent deliveries error:', error);
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  app.get("/api/agent/my-deliveries", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deliveries = await storage.getDeliveryAssignmentsByAgentId(req.user!.uid);
      res.json(deliveries);
    } catch (error) {
      console.error('Get agent assigned deliveries error:', error);
      res.status(500).json({ message: "Failed to fetch assigned deliveries" });
    }
  });

  app.post("/api/agent/accept-delivery/:id", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const assignment = await storage.acceptDeliveryAssignment(req.params.id, req.user!.uid);
      res.json(assignment);
    } catch (error) {
      console.error('Accept delivery error:', error);
      res.status(400).json({ message: "Failed to accept delivery" });
    }
  });

  // Legacy vendor routes for backwards compatibility (will be removed)
  app.get("/api/orders/vendor", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const orders = await storage.getVendorOrdersByVendorId(req.user!.uid);
      res.json(orders);
    } catch (error) {
      console.error('Get legacy vendor orders error:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/shops", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Return distributors as "shops" for legacy compatibility
      const products = await storage.getAllWholesaleProducts();
      const distributorIds = Array.from(new Set(products.map(p => p.distributorId)));
      const distributors = [];
      
      for (const distributorId of distributorIds) {
        // This is a simplified approach - in a real app you'd have a proper query
        const products_for_distributor = products.filter(p => p.distributorId === distributorId);
        if (products_for_distributor.length > 0) {
          distributors.push({
            id: distributorId,
            shopName: "Wholesale Distributor",
            address: "Distributor Address",
            isActive: true
          });
        }
      }
      
      res.json(distributors);
    } catch (error) {
      console.error('Get legacy shops error:', error);
      res.status(500).json({ message: "Failed to fetch shops" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}