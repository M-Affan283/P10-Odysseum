import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("adminAuth: No Authorization header or header missing 'Bearer '");
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  
  const token = authHeader.split(" ")[1];
  console.log("adminAuth: Received token:", token);
  
  try {
    // Verify the token using the same secret that was used to sign it (ACCESS_TOKEN_SECRET)
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("adminAuth: Decoded token:", decoded);
    
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== "admin") {
      console.error("adminAuth: Admin not found or role is not 'admin'. Admin:", admin);
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    
    req.user = admin;
    next();
  } catch (error) {
    console.error("adminAuth: Error verifying token:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
