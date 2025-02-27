import { Request, Response, NextFunction } from "express";
import { admin } from "./firebase-admin";

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.body.uid = decodedToken.uid; // Save the user ID
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
}
