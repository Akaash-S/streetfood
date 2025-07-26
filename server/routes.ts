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
    
    // Try to verify with Firebase Admin if available
    if (admin.apps.length > 0) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        return next();
      } catch (error) {
        console.error('Firebase token verification failed:', error);
      }
    }
    
    // Fallback: decode token manually for development (NOT FOR PRODUCTION)
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      req.user = { uid: payload.user_id || payload.sub, email: payload.email };
      return next();
    } catch (error) {
      console.error('Token decode failed:', error);
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
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Placeholder routes for future features
  
  // Shop routes (for shop owners)
  app.get("/api/shops", verifyFirebaseToken, async (req, res) => {
    // TODO: Implement get all shops
    res.json({ message: "Get shops endpoint - to be implemented" });
  });

  app.post("/api/shops", verifyFirebaseToken, async (req, res) => {
    // TODO: Implement create shop (for shop owners)
    res.json({ message: "Create shop endpoint - to be implemented" });
  });

  // Product routes (for shop owners)
  app.get("/api/products", verifyFirebaseToken, async (req, res) => {
    // TODO: Implement get products
    res.json({ message: "Get products endpoint - to be implemented" });
  });

  app.post("/api/products", verifyFirebaseToken, async (req, res) => {
    // TODO: Implement create product
    res.json({ message: "Create product endpoint - to be implemented" });
  });

  // Order routes (for vendors and shop owners)
  app.get("/api/orders", verifyFirebaseToken, async (req, res) => {
    // TODO: Implement get orders by user role
    res.json({ message: "Get orders endpoint - to be implemented" });
  });

  app.post("/api/orders", verifyFirebaseToken, async (req, res) => {
    // TODO: Implement create order (for vendors)
    res.json({ message: "Create order endpoint - to be implemented" });
  });

  app.patch("/api/orders/:id/status", verifyFirebaseToken, async (req, res) => {
    // TODO: Implement update order status (for shop owners)
    res.json({ message: "Update order status endpoint - to be implemented" });
  });

  // Delivery routes (for delivery agents)
  app.get("/api/deliveries", verifyFirebaseToken, async (req, res) => {
    // TODO: Implement get available deliveries
    res.json({ message: "Get deliveries endpoint - to be implemented" });
  });

  app.post("/api/deliveries/:id/accept", verifyFirebaseToken, async (req, res) => {
    // TODO: Implement accept delivery
    res.json({ message: "Accept delivery endpoint - to be implemented" });
  });

  app.patch("/api/deliveries/:id/status", verifyFirebaseToken, async (req, res) => {
    // TODO: Implement update delivery status
    res.json({ message: "Update delivery status endpoint - to be implemented" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
