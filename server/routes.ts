import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
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
    
    // Verify token with Firebase Admin SDK
    try {
      if (admin.apps.length > 0) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        return next();
      } else {
        // Fallback for development: decode token payload
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
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByFirebaseUid(req.user!.uid);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user in database
      const user = await storage.createUser({
        ...userData,
        firebaseUid: req.user!.uid,
      });

      res.status(201).json({ user });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Protected user routes
  app.get("/api/users/me", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log("Getting user for UID:", req.user!.uid);
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) {
        console.log("User not found in storage");
        return res.status(404).json({ message: "User not found" });
      }
      console.log("User found:", user);
      res.json(user);
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Shop routes
  app.get("/api/shops", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const shops = await storage.getAllShops();
      res.json(shops);
    } catch (error: any) {
      console.error("Get shops error:", error);
      res.status(500).json({ message: "Failed to get shops" });
    }
  });

  // Order routes
  app.get("/api/orders/vendor", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const orders = await storage.getOrdersByVendorId(req.user!.uid);
      res.json(orders);
    } catch (error: any) {
      console.error("Get vendor orders error:", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  });

  app.get("/api/orders/shop", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const shops = await storage.getShopsByOwnerId(user.id);
      let allOrders: any[] = [];
      
      for (const shop of shops) {
        const orders = await storage.getOrdersByShopId(shop.id);
        allOrders = [...allOrders, ...orders];
      }
      
      res.json(allOrders);
    } catch (error: any) {
      console.error("Get shop orders error:", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  });

  app.patch("/api/orders/:orderId/status", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.orderId, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Delivery routes
  app.get("/api/delivery/available", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requests = await storage.getAvailableDeliveryRequests();
      res.json(requests);
    } catch (error: any) {
      console.error("Get delivery requests error:", error);
      res.status(500).json({ message: "Failed to get delivery requests" });
    }
  });

  app.post("/api/delivery/:requestId/accept", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const request = await storage.acceptDeliveryRequest(req.params.requestId, req.user!.uid);
      if (!request) {
        return res.status(404).json({ message: "Delivery request not found" });
      }
      res.json(request);
    } catch (error: any) {
      console.error("Accept delivery request error:", error);
      res.status(500).json({ message: "Failed to accept delivery request" });
    }
  });

  // Distributor routes
  app.get("/api/distributor/products", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const products = await storage.getWholesaleProductsByDistributorId(req.user!.uid);
      res.json(products);
    } catch (error) {
      console.error("Error fetching wholesale products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/distributor/products", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const productData = { ...req.body, distributorId: req.user!.uid };
      const product = await storage.createWholesaleProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating wholesale product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/distributor/products/:id", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updatedProduct = await storage.updateWholesaleProduct(id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating wholesale product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/distributor/products/:id", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWholesaleProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting wholesale product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/distributor/orders", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const orders = await storage.getBulkOrdersByDistributorId(req.user!.uid);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching bulk orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.put("/api/distributor/orders/:id/status", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedOrder = await storage.updateBulkOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.get("/api/distributor/deliveries", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deliveries = await storage.getShopDeliveriesByDistributorId(req.user!.uid);
      res.json(deliveries);
    } catch (error) {
      console.error("Error fetching shop deliveries:", error);
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  app.post("/api/distributor/deliveries", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deliveryData = { ...req.body, distributorId: req.user!.uid };
      const delivery = await storage.createShopDelivery(deliveryData);
      res.status(201).json(delivery);
    } catch (error) {
      console.error("Error creating shop delivery:", error);
      res.status(500).json({ message: "Failed to create delivery" });
    }
  });

  app.put("/api/distributor/deliveries/:id/status", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedDelivery = await storage.updateShopDeliveryStatus(id, status);
      if (!updatedDelivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      res.json(updatedDelivery);
    } catch (error) {
      console.error("Error updating delivery status:", error);
      res.status(500).json({ message: "Failed to update delivery status" });
    }
  });

  // Browse all wholesale products (for shop owners)
  app.get("/api/wholesale/products", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const products = await storage.getAllWholesaleProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching all wholesale products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
