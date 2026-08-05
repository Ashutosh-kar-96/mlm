import { Router } from "express";
import {
  addToCart,
  addFund,
  cart,
  checkout,
  createProduct,
  products,
  removeCartItem,
  updateCartItem,
  updateProduct,
  walletLedger,
} from "../controllers/commerce.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/products", products);
router.post("/products", requireRole("admin"), createProduct);
router.patch("/products/:id", requireRole("admin"), updateProduct);
router.get("/cart", cart);
router.post("/cart", addToCart);
router.patch("/cart/:id", updateCartItem);
router.delete("/cart/:id", removeCartItem);
router.post("/checkout", checkout);
router.get("/wallet-ledger", walletLedger);
router.post("/wallet-ledger/add-fund", addFund);

export default router;
