import { Router } from "express";
import { requireRole } from "../middlewares/auth.middleware.js";
import {
  activate,
  createPlan,
  deactivate,
  generate,
  list,
  plans,
  transfer,
  transfers,
  updatePlan,
  usePin,
  used,
} from "../controllers/pin.controller.js";

const router = Router();

router.get("/plans", requireRole("admin"), plans);
router.post("/plans", requireRole("admin"), createPlan);
router.patch("/plans/:id", requireRole("admin"), updatePlan);
router.get("/pin", requireRole("admin"), list);
router.post("/batches", requireRole("admin"), generate);
router.patch("/status/active", requireRole("admin"), activate);
router.patch("/status/inactive", requireRole("admin"), deactivate);
router.post("/transfers", requireRole("admin"), transfer);
router.post("/redemptions", usePin);
router.get("/transfers", requireRole("admin"), transfers);
router.get("/redemptions", requireRole("admin"), used);

router.post("/generate", requireRole("admin"), generate);
router.patch("/activate", requireRole("admin"), activate);
router.patch("/deactivate", requireRole("admin"), deactivate);
router.post("/transfer", requireRole("admin"), transfer);
router.post("/use", usePin);
router.get("/used", requireRole("admin"), used);

export default router;
