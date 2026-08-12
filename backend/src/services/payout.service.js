import prisma from "../config/db.js";
import { dateRange, pagination } from "../utils/query.js";
import { walletBalance } from "./mlm.service.js";
import { logAudit } from "./audit.service.js";

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
const monthlyReferenceId = (cycleKey, regno) => `monthly_payout_${cycleKey}_${regno}`;
const currentCycleKey = () => new Date().toISOString().slice(0, 7);
const validCycleKey = (cycleKey) => /^\d{4}-\d{2}$/.test(String(cycleKey || ""));

const resolveCycleKey = (cycleKey) => {
  const key = cycleKey || currentCycleKey();
  if (!validCycleKey(key)) {
    const error = new Error("Month must be in YYYY-MM format");
    error.status = 400;
    throw error;
  }
  return key;
};

const monthlyPaidWhere = (cycleKey, query = {}) => ({
  type: "Monthly Payout",
  referenceId: { startsWith: `monthly_payout_${cycleKey}_` },
  ...(query.regno ? { regno: { contains: query.regno } } : {}),
  ...(query.q ? {
    OR: [
      { regno: { contains: query.q } },
      { member: { is: { firstName: { contains: query.q } } } },
      { member: { is: { lastName: { contains: query.q } } } },
      { member: { is: { mobileNo: { contains: query.q } } } },
    ],
  } : {}),
});

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

export const listMonthlyPaid = async (query = {}) => {
  const cycleKey = resolveCycleKey(query.month || query.cycleKey);
  const { skip, take, page, limit } = pagination(query);
  const where = monthlyPaidWhere(cycleKey, query);

  const [items, total, totals] = await Promise.all([
    prisma.walletLedger.findMany({
      where,
      skip,
      take,
      include: { member: { include: { rank: true, panVerification: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.walletLedger.count({ where }),
    prisma.walletLedger.aggregate({ where, _sum: { amount: true } }),
  ]);

  return { cycleKey, items, totals: { amount: totals._sum.amount || 0 }, meta: { page, limit, total } };
};

export const listMonthlyUnpaid = async (query = {}) => {
  const cycleKey = resolveCycleKey(query.month || query.cycleKey);
  const { skip, take, page, limit } = pagination(query);
  const paid = await prisma.walletLedger.findMany({
    where: monthlyPaidWhere(cycleKey),
    select: { regno: true },
  });
  const paidRegnos = [...new Set(paid.map((item) => item.regno))];
  const where = {
    status: 1,
    ...(paidRegnos.length ? { regno: { notIn: paidRegnos } } : {}),
    ...(query.regno ? { regno: { contains: query.regno } } : {}),
    ...(query.q ? {
      OR: [
        { regno: { contains: query.q } },
        { firstName: { contains: query.q } },
        { lastName: { contains: query.q } },
        { mobileNo: { contains: query.q } },
        { emailId: { contains: query.q } },
      ],
    } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take,
      include: { rank: true, panVerification: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.member.count({ where }),
  ]);

  return { cycleKey, items, meta: { page, limit, total } };
};

export const payMonthlyMember = async (data = {}, adminId) => {
  const cycleKey = resolveCycleKey(data.month || data.cycleKey);
  const amount = money(data.amount);
  if (!data.regno || amount <= 0) {
    const error = new Error("Member and amount are required");
    error.status = 400;
    throw error;
  }

  const member = await prisma.member.findUnique({ where: { regno: data.regno } });
  if (!member) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }

  const referenceId = monthlyReferenceId(cycleKey, member.regno);
  const existing = await prisma.walletLedger.findFirst({ where: { referenceId } });
  if (existing) {
    const error = new Error("This member is already paid for the selected month");
    error.status = 400;
    throw error;
  }

  const remarks = String(data.remarks || "").trim();

  return prisma.$transaction(async (tx) => {
    const balance = await walletBalance(member.regno, tx);
    const ledger = await tx.walletLedger.create({
      data: {
        regno: member.regno,
        type: "Monthly Payout",
        description: remarks ? `Monthly payout ${cycleKey} - ${remarks}` : `Monthly payout ${cycleKey}`,
        amount,
        balance: balance + amount,
        referenceId,
      },
      include: { member: { include: { rank: true, panVerification: true } } },
    });

    await logAudit(adminId, "monthly-payout.pay", "Member", member.regno, {
      cycleKey,
      amount,
      referenceId,
      remarks: remarks || undefined,
      balance: balance + amount,
    }, tx);

    return { cycleKey, ledger, balance: balance + amount };
  });
};
