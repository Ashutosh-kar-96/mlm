import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No access token provided" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "dev-access-secret"
    );
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired access token" });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ success: false, message: "You are not allowed to perform this action" });
  }
  next();
};
