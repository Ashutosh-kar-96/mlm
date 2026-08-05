import { Router } from "express";
import { commissions, history, plan, rewards, updateReward, upgrade } from "../controllers/rank.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireRole("admin"));

router.get("/history", history);
router.post("/upgrade", upgrade);
router.get("/commissions", commissions);
router.get("/plan", plan);
router.get("/rewards", rewards);
router.patch("/rewards/:id", updateReward);

export default router;
