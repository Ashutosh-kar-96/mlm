import { Router } from "express";
import { requireRole } from "../middlewares/auth.middleware.js";
import {
  createDashboardMessage,
  createHelpDesk,
  dashboardMessages,
  deleteHelpDesk,
  helpDesk,
  replyHelpDesk,
  updateDashboardMessageStatus,
} from "../controllers/support.controller.js";

const router = Router();

router.get("/tickets", helpDesk);
router.post("/tickets", createHelpDesk);
router.post("/tickets/:id/replies", requireRole("admin"), replyHelpDesk);
router.delete("/tickets/:id", requireRole("admin"), deleteHelpDesk);
router.get("/dashboard-messages", requireRole("admin"), dashboardMessages);
router.post("/dashboard-messages", requireRole("admin"), createDashboardMessage);
router.patch("/dashboard-messages/:id/status", requireRole("admin"), updateDashboardMessageStatus);

router.get("/help-desk", helpDesk);
router.post("/help-desk", createHelpDesk);
router.post("/help-desk/:id/reply", requireRole("admin"), replyHelpDesk);
router.delete("/help-desk/:id", requireRole("admin"), deleteHelpDesk);

export default router;
