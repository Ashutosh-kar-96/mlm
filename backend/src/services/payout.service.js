import prisma from "../config/db.js";
import { dateRange, pagination } from "../utils/query.js";
import { walletBalance } from "./mlm.service.js";

const payoutWhere = (query, status) => ({
  ...(status !== undefined ? { status } : {}),
  ...(query.regno ? { regno: { contains: query.regno } } : {}),
  ...dateRange(status === 1 ? "paymentDate" : "createdAt", query.fromDate, query.toDate),
});

export const listPayouts = async (query, status) => {
  const { skip, take, page, limit } = pagination(query);
  const where = payoutWhere(query, status);

  const [items, total, totals] = await Promise.all([
    prisma.payout.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.payout.count({ where }),
    prisma.payout.aggregate({
      where,
      _sum: { generationBonus: true, levelBonus: true, totalAmount: true, tds: true, adminCharge: true, netAmount: true },
    }),
  ]);

  return { items, totals: totals._sum, meta: { page, limit, total } };
};

const money = (value) => Number(value || 0);

export const createPayout = async (data) => {
  const member = await prisma.member.findUnique({ where: { regno: data.regno } });
  if (!member) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }

  const totalAmount = money(data.totalAmount);
  const tds = money(data.tds);
  const adminCharge = money(data.adminCharge);
  const netAmount = data.netAmount === undefined ? totalAmount - tds - adminCharge : money(data.netAmount);
  if (totalAmount <= 0 || netAmount <= 0) {
    const error = new Error("Payout amount must be greater than zero");
    error.status = 400;
    throw error;
  }

  const balance = await walletBalance(data.regno);
  if (netAmount > balance) {
    const error = new Error("Payout cannot exceed available wallet balance");
    error.status = 400;
    throw error;
  }

  return prisma.payout.create({
    data: {
      ...data,
      name: data.name || [member.firstName, member.lastName].filter(Boolean).join(" "),
      bankName: data.bankName ?? member.bankName,
      accountNo: data.accountNo ?? member.accountNo,
      ifscCode: data.ifscCode ?? member.ifscCode,
      mobile: data.mobile ?? member.mobileNo,
      aadhaarNo: data.aadhaarNo ?? member.aadhaarNo,
      panNo: data.panNo ?? member.panNo,
      totalAmount,
      tds,
      adminCharge,
      netAmount,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
    },
  });
};

export const markDistributed = async (ids, data = {}) => {
  const payoutIds = [...new Set(ids.map(Number).filter(Boolean))];
  if (!payoutIds.length) {
    const error = new Error("At least one payout ID is required");
    error.status = 400;
    throw error;
  }

  const pendingCount = await prisma.payout.count({
    where: { id: { in: payoutIds }, status: 0 },
  });
  if (pendingCount !== payoutIds.length) {
    const error = new Error("Only pending payouts can be distributed");
    error.status = 400;
    throw error;
  }

  return prisma.payout.updateMany({
    where: { id: { in: payoutIds }, status: 0 },
    data: {
      status: 1,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
      transactionRef: data.transactionRef,
      paymentMode: data.paymentMode,
      remarks: data.remarks,
    },
  });
};
