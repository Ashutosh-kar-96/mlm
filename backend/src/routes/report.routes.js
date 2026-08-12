import { Router } from "express";
import { downlineBusiness, onlineTransactions, orders, pool, updateOrderDeliveryStatus } from "../controllers/report.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireRole("admin"));

router.get("/downline-business", downlineBusiness);
router.get("/online-transactions", onlineTransactions);
router.get("/orders", orders);
router.patch("/orders/:id/delivery-status", updateOrderDeliveryStatus);
router.get("/pool/fashion-influencer", pool("Fashion Influencer"));
router.get("/pool/vision-influencer", pool("Vision Influencer"));
router.get("/pool/promoter", pool("Promoter"));
router.get("/pool/sales-executive", pool("Sales Executive"));
router.get("/pool/junior-sales-executive", pool("Junior Sales Executive"));
router.get("/pool/senior-sales-executive", pool("Senior Sales Executive"));
router.get("/pool/zonal-sales-executive", pool("Zonal Sales Executive"));

export default router;
