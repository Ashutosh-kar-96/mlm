import { Router } from "express";
import {
  activateMember,
  blockMember,
  createMember,
  creditWallet,
  getDownline,
  getMember,
  grantLicenses,
  listMembers,
  ranks,
  unblockMember,
  updateMemberStatus,
  updateMember,
} from "../controllers/member.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/ranks", ranks);
router.get("/member", requireRole("admin"), listMembers());
router.post("/member", createMember);
router.get("/status/active", requireRole("admin"), listMembers("active"));
router.get("/status/unpaid", requireRole("admin"), listMembers("unpaid"));
router.get("/status/blocked", requireRole("admin"), listMembers("blocked"));
router.get("/:regno", getMember);
router.patch("/:regno", requireRole("admin"), updateMember);
router.patch("/:regno/status", requireRole("admin"), updateMemberStatus);
router.post("/:regno/wallet-credit", requireRole("admin"), creditWallet);
router.post("/:regno/licenses", requireRole("admin"), grantLicenses);
router.patch("/:regno/activate", requireRole("admin"), activateMember);
router.patch("/:regno/block", requireRole("admin"), blockMember);
router.patch("/:regno/unblock", requireRole("admin"), unblockMember);
router.get("/:regno/downline", getDownline);

export default router;
