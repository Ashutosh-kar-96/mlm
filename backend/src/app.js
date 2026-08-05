import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import adminRoutes from "./routes/admin.routes.js";
import commerceRoutes from "./routes/commerce.routes.js";
import memberRoutes from "./routes/member.routes.js";
import panRoutes from "./routes/pan.routes.js";
import payoutRoutes from "./routes/payout.routes.js";
import pinRoutes from "./routes/pin.routes.js";
import rankRoutes from "./routes/rank.routes.js";
import reportRoutes from "./routes/report.routes.js";
import supportRoutes from "./routes/support.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "500mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "MLM backend is running" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/commerce", authenticate, commerceRoutes);
app.use("/api/members", authenticate, memberRoutes);
app.use("/api/pan-verifications", authenticate, panRoutes);
app.use("/api/pan", authenticate, panRoutes);
app.use("/api/reports", authenticate, reportRoutes);
app.use("/api/payouts", authenticate, payoutRoutes);
app.use("/api/pins", authenticate, pinRoutes);
app.use("/api/ranks", authenticate, rankRoutes);
app.use("/api/support", authenticate, supportRoutes);
app.use("/api/uploads", authenticate, uploadRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

export default app;
