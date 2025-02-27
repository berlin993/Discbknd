import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

let remainingRewards = 5;

export async function registerRoutes(app: Express) {
  app.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    try {
      const user = await storage.createUser(result.data);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/me", async (req, res) => {
    try {
      // For prototype: Trust the client-provided UID
      const uid = req.query.uid as string;
      if (!uid) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUserByUid(uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/levels/complete", async (req, res) => {
    try {
      const uid = req.query.uid as string;
      if (!uid) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { levelId } = req.body;
      if (typeof levelId !== "number") {
        return res.status(400).json({ message: "Invalid level ID" });
      }

      const user = await storage.getUserByUid(uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.completeLevel(user.id, levelId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing level:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/rewards/remaining", (_req, res) => {
    res.json(remainingRewards);
  });

  const httpServer = createServer(app);
  return httpServer;
}