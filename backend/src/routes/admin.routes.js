import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import { changePassword, dashboard, login, logout, refreshToken } from "../controllers/admin.controller.js";
import { auditLogs } from "../controllers/audit.controller.js";

const router = Router();

router.post("/auth/login", login);
router.post("/auth/refresh", refreshToken);
router.post("/auth/logout", authenticate, requireRole("admin"), logout);
router.patch("/auth/password", authenticate, requireRole("admin"), changePassword);
router.get("/dashboard", authenticate, requireRole("admin"), dashboard);
router.get("/audit-logs", authenticate, requireRole("admin"), auditLogs);

router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticate, requireRole("admin"), logout);
router.patch("/change-password", authenticate, requireRole("admin"), changePassword);

export default router;
