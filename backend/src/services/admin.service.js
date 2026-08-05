import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const accessTokenSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "dev-access-secret";
const refreshTokenSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "dev-refresh-secret";
const accessTokenExpiry = () => process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const refreshTokenExpiry = () => process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const memberSummarySelect = {
  regno: true,
  firstName: true,
  lastName: true,
  mobileNo: true,
  emailId: true,
  sponsorId: true,
  status: true,
  planAmount: true,
  doj: true,
  paidDate: true,
  rank: true,
};

const adminPayload = (admin) => ({
  id: admin.id,
  username: admin.username,
  role: "admin",
});

const issueTokens = (admin) => {
  const payload = adminPayload(admin);
  const accessToken = jwt.sign(payload, accessTokenSecret(), {
    expiresIn: accessTokenExpiry(),
  });
  const refreshToken = jwt.sign(
    { ...payload, tokenType: "refresh" },
    refreshTokenSecret(),
    { expiresIn: refreshTokenExpiry() }
  );

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: accessTokenExpiry(),
    refreshExpiresIn: refreshTokenExpiry(),
  };
};

export const login = async ({ username, password }) => {
  const admin = await prisma.admin.findFirst({ where: { username } });
  if (!admin) {
    const error = new Error("Invalid username or password");
    error.status = 401;
    throw error;
  }

  const passwordMatches = admin.password?.startsWith("$2")
    ? await bcrypt.compare(password, admin.password)
    : admin.password === password;

  if (!passwordMatches) {
    const error = new Error("Invalid username or password");
    error.status = 401;
    throw error;
  }

  return {
    ...issueTokens(admin),
    admin: { id: admin.id, username: admin.username },
  };
};

export const refreshToken = async ({ refreshToken }) => {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.status = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, refreshTokenSecret());
  } catch {
    const error = new Error("Invalid refresh token");
    error.status = 401;
    throw error;
  }

  if (decoded.tokenType !== "refresh") {
    const error = new Error("Invalid token type");
    error.status = 401;
    throw error;
  }

  const admin = await prisma.admin.findUnique({ where: { id: Number(decoded.id) } });
  if (!admin) {
    const error = new Error("Admin not found");
    error.status = 404;
    throw error;
  }

  return {
    ...issueTokens(admin),
    admin: { id: admin.id, username: admin.username },
  };
};

export const logout = async () => {
  return { message: "Logged out successfully. Remove access and refresh tokens from the client." };
};

export const changePassword = async (adminId, { oldPassword, newPassword }) => {
  const admin = await prisma.admin.findUnique({ where: { id: Number(adminId) } });
  if (!admin) {
    const error = new Error("Admin not found");
    error.status = 404;
    throw error;
  }

  const passwordMatches = admin.password?.startsWith("$2")
    ? await bcrypt.compare(oldPassword, admin.password)
    : admin.password === oldPassword;

  if (!passwordMatches) {
    const error = new Error("Old password is incorrect");
    error.status = 400;
    throw error;
  }

  const password = await bcrypt.hash(newPassword, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { password, updatedAt: new Date() } });
  return { message: "Password changed successfully" };
};

export const getDashboard = async () => {
  const [
    totalUsers,
    activeUsers,
    unpaidUsers,
    blockedUsers,
    pendingPan,
    pendingPayouts,
    totalBusiness,
    currentBusiness,
    recentMembers,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: 1 } }),
    prisma.member.count({ where: { status: 0 } }),
    prisma.member.count({ where: { status: 2 } }),
    prisma.panVerification.count({ where: { status: "Pending" } }),
    prisma.payout.count({ where: { status: 0 } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        saleDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: memberSummarySelect,
    }),
  ]);

  return {
    stats: {
      totalUsers,
      activeUsers,
      unpaidUsers,
      blockedUsers,
      pendingPan,
      pendingPayouts,
      totalBusiness: totalBusiness._sum.totalAmount || 0,
      currentBusiness: currentBusiness._sum.totalAmount || 0,
    },
    recentMembers,
  };
};
