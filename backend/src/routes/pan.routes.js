import { Router } from "express";
import { cancel, list, pending, updateStatus, verified, verify } from "../controllers/pan.controller.js";

const router = Router();

router.get("/pan", list);
router.get("/status/pending", pending);
router.get("/status/verified", verified);
router.patch("/:id/status", updateStatus);
router.patch("/:id/verify", verify);
router.patch("/:id/cancel", cancel);

export default router;
