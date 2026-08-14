import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import {
  createUser,
  createWithdrawal,
  changeMyPassword,
  commissions,
  dashboard,
  getUsers,
  login,
  me,
  mlmSummary,
  network,
  orders,
  packages,
  payouts,
  refreshToken,
  register,
  submitKyc,
  subscribeGpg,
  updateMyProfile,
  wallet,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/auth/login", login);
router.post("/auth/register", register);
router.post("/auth/refresh", refreshToken);
router.get("/auth/me", authenticate, me);
router.get("/me/dashboard", authenticate, dashboard);
router.get("/me/wallet", authenticate, wallet);
router.get("/me/payouts", authenticate, payouts);
router.post("/me/withdrawals", authenticate, createWithdrawal);
router.get("/me/network", authenticate, network);
router.get("/me/orders", authenticate, orders);
router.get("/me/commissions", authenticate, commissions);
router.get("/me/mlm", authenticate, mlmSummary);
router.post("/me/gpg-subscriptions", authenticate, subscribeGpg);
router.patch("/me/profile", authenticate, updateMyProfile);
router.patch("/me/password", authenticate, changeMyPassword);
router.post("/me/kyc", authenticate, submitKyc);
router.get("/packages", authenticate, packages);

router.get("/users", authenticate, requireRole("admin"), getUsers);
router.post("/user", authenticate, requireRole("admin"), createUser);

export default router;
