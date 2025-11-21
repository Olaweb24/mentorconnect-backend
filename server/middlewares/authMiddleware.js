// server/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Expected format: "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Malformed token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }

    next();
  } catch (err) {
    console.error("AuthMiddleware error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}
