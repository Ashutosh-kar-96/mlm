import { Router } from "express";
import { create, distribute, distributed, pending } from "../controllers/payout.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireRole("admin"));

router.get("/pending", pending);
router.get("/distributed", distributed);
router.post("/payout", create);
router.patch("/distribute", distribute);

export default router;
