import { Router } from "express";
import { autoAssignGpg, commissions, gpgSubscriptions, history, licenseUsages, plan, rankChallenges, rewards, updateGpgApproval, updateReward, upgrade } from "../controllers/rank.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireRole("admin"));

router.get("/history", history);
router.post("/upgrade", upgrade);
router.get("/commissions", commissions);
router.get("/plan", plan);
router.get("/rewards", rewards);
router.patch("/rewards/:id", updateReward);
router.get("/gpg-subscriptions", gpgSubscriptions);
router.patch("/gpg-subscriptions/:id", updateGpgApproval);
router.post("/gpg-subscriptions/auto-assign", autoAssignGpg);
router.get("/license-usages", licenseUsages);
router.get("/rank-challenges", rankChallenges);

export default router;
