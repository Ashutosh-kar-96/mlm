import { Router } from "express";
import {
  create,
  distribute,
  distributed,
  monthlyPaid,
  monthlyUnpaid,
  payMonthlyMember,
  pending,
} from "../controllers/payout.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireRole("admin"));

router.get("/pending", pending);
router.get("/distributed", distributed);
router.get("/monthly/paid", monthlyPaid);
router.get("/monthly/unpaid", monthlyUnpaid);
router.post("/payout", create);
router.post("/monthly/pay", payMonthlyMember);
router.patch("/distribute", distribute);

export default router;
