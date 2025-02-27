import { adminAuth } from "./firebaseAdmin";
import { Request, Response, NextFunction } from "express";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split("Bearer ")[1]; // Token extract karo

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken; // User ka data request me store kar do
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(403).json({ message: "Unauthorized: Invalid token" });
  }
}
