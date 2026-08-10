import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { commissions, createMemberGenealogy, validateSponsor, walletBalance } from "./mlm.service.js";

const accessTokenSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "dev-access-secret";
const refreshTokenSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "dev-refresh-secret";
const accessTokenExpiry = () => process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const refreshTokenExpiry = () => process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const publicMemberSelect = {
  id: true,
  regno: true,
  username: true,
  firstName: true,
  lastName: true,
  emailId: true,
  mobileNo: true,
  sponsorId: true,
  aadhaarNo: true,
  fatherName: true,
  birthday: true,
  bankName: true,
  branch: true,
  accountNo: true,
  accountType: true,
  ifscCode: true,
  panNo: true,
  accountHolderName: true,
  rank: true,
  panVerification: true,
  planAmount: true,
  status: true,
  doj: true,
};

const toPublicMember = (member) => ({
  id: member.id,
  regno: member.regno,
  username: member.username,
  name: [member.firstName, member.lastName].filter(Boolean).join(" "),
  firstName: member.firstName,
  lastName: member.lastName,
  email: member.emailId,
  mobile: member.mobileNo,
  sponsorId: member.sponsorId,
  aadhaarNo: member.aadhaarNo,
  fatherName: member.fatherName,
  birthday: member.birthday,
  bankName: member.bankName,
  branch: member.branch,
  accountNo: member.accountNo,
  accountType: member.accountType,
  ifscCode: member.ifscCode,
  panNo: member.panNo,
  accountHolderName: member.accountHolderName,
  rank: member.rank?.rankName || "Member",
  kyc: member.panVerification?.status || "Pending",
  planAmount: member.planAmount,
  status: member.status,
  joined: member.doj,
  role: "user",
});

const issueTokens = (member) => {
  const payload = { id: member.id, regno: member.regno, role: "user" };
  const accessToken = jwt.sign(payload, accessTokenSecret(), { expiresIn: accessTokenExpiry() });
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

const passwordMatches = async (inputPassword, storedPassword) => {
  if (!storedPassword) return false;
  return storedPassword.startsWith("$2")
    ? bcrypt.compare(inputPassword, storedPassword)
    : storedPassword === inputPassword;
};

const nextRegno = async () => {
  const lastMember = await prisma.member.findFirst({
    where: { regno: { startsWith: "AF" } },
    orderBy: { id: "desc" },
    select: { regno: true, id: true },
  });
  const lastNumber = Number(String(lastMember?.regno || "").replace(/\D/g, ""));
  const nextNumber = Number.isFinite(lastNumber) && lastNumber > 0 ? lastNumber + 1 : (lastMember?.id || 1000) + 1;
  return `AF${String(nextNumber).padStart(8, "0")}`;
};

export const getAllUsers = () =>
  prisma.member.findMany({
    include: { rank: true, panVerification: true },
    orderBy: { createdAt: "desc" },
  });

export const createUser = async (data) => {
  if (!(data.firstName || data.name)) {
    const error = new Error("Member name is required");
    error.status = 400;
    throw error;
  }
  if (!data.password || String(data.password).length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.status = 400;
    throw error;
  }
  const password = data.password ? await bcrypt.hash(data.password, 10) : undefined;

  await validateSponsor(data.sponsorId);

  return prisma.$transaction(async (tx) => {
    const freeSignupRank = await tx.rank.findFirst({
      where: { rankName: "Free Signup", percentage: 0 },
      select: { id: true },
    });
    const member = await tx.member.create({
      data: {
        regno: data.regno || await nextRegno(),
        username: data.username,
        firstName: data.firstName || data.name,
        lastName: data.lastName,
        password,
        emailId: data.email || data.emailId,
        mobileNo: data.mobile || data.mobileNo,
        sponsorId: data.sponsorId,
        rankId: data.rankId ?? freeSignupRank?.id,
        doj: data.doj ? new Date(data.doj) : new Date(),
        planAmount: data.planAmount ?? 0,
        status: data.status ?? 0,
      },
    });
    await createMemberGenealogy(member, tx);
    return member;
  });
};

export const register = async (data) => {
  const member = await createUser(data);
  const fullMember = await prisma.member.findUnique({
    where: { regno: member.regno },
    select: publicMemberSelect,
  });

  return {
    ...issueTokens(fullMember),
    user: toPublicMember(fullMember),
  };
};

export const login = async ({ identifier, email, username, regno, password }) => {
  const loginId = identifier || email || username || regno;
  if (!loginId || !password) {
    const error = new Error("Login ID and password are required");
    error.status = 400;
    throw error;
  }

  const member = await prisma.member.findFirst({
    where: {
      OR: [
        { regno: loginId },
        { username: loginId },
        { emailId: loginId },
        { mobileNo: loginId },
      ],
    },
    include: { rank: true, panVerification: true },
  });

  if (!member || !(await passwordMatches(password, member.password))) {
    const error = new Error("Invalid login ID or password");
    error.status = 401;
    throw error;
  }

  if (member.status === 2) {
    const error = new Error("Your account is blocked. Please contact support.");
    error.status = 403;
    throw error;
  }

  return {
    ...issueTokens(member),
    user: toPublicMember(member),
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

  if (decoded.tokenType !== "refresh" || decoded.role !== "user") {
    const error = new Error("Invalid token type");
    error.status = 401;
    throw error;
  }

  const member = await prisma.member.findUnique({
    where: { id: Number(decoded.id) },
    include: { rank: true, panVerification: true },
  });
  if (!member) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }

  return {
    ...issueTokens(member),
    user: toPublicMember(member),
  };
};

export const me = async (user) => {
  const member = await prisma.member.findUnique({
    where: { id: Number(user.id) },
    include: { rank: true, panVerification: true },
  });
  if (!member) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }

  return toPublicMember(member);
};

const money = (value) => Number(value || 0);
const monthKey = (date) => date.toLocaleString("en-US", { month: "short" });
const monthRange = (date = new Date(), offset = 0) => {
  const start = new Date(date.getFullYear(), date.getMonth() + offset, 1);
  const end = new Date(date.getFullYear(), date.getMonth() + offset + 1, 1);
  return { start, end };
};
const percentageChange = (current, previous) => {
  if (!previous) return current ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const memberByToken = async (user) => {
  const member = await prisma.member.findUnique({
    where: { id: Number(user.id) },
    include: {
      rank: true,
      panVerification: true,
      orders: { orderBy: { saleDate: "desc" }, include: { shop: true, items: true } },
      onlineTransactions: { orderBy: { txnDate: "desc" } },
      payouts: { orderBy: { createdAt: "desc" } },
      pinsTransferredTo: { orderBy: { transferDate: "desc" }, include: { pin: { include: { plan: true, usage: true } } } },
    },
  });

  if (!member) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }

  return member;
};

export const mlmSummary = async (user) => {
  const requiredMemberSelect = {
    id: true,
    regno: true,
    rank: true,
  };
  const optionalMlmMemberSelect = {
    ...requiredMemberSelect,
    licensesRemaining: true,
    rank38AchievedAt: true,
  };
  const safeMemberForMlm = async () => {
    try {
      return await prisma.member.findUnique({
        where: { id: Number(user.id) },
        select: optionalMlmMemberSelect,
      });
    } catch (error) {
      if (error.code !== "P2022") throw error;
      return prisma.member.findUnique({
        where: { id: Number(user.id) },
        select: requiredMemberSelect,
      });
    }
  };
  const member = await safeMemberForMlm();
  if (!member) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }
  const safeFindMany = async (delegate, args, fallback = []) => {
    if (!delegate?.findMany) return fallback;
    try {
      return await delegate.findMany(args);
    } catch (error) {
      if (["P2021", "P2022"].includes(error.code)) return fallback;
      throw error;
    }
  };

  const [licenseHistory, gpgSubscriptions, rankChallenges, rankHistory, recentCommissions] = await Promise.all([
    safeFindMany(prisma.licenseUsage, {
      where: { OR: [{ giverRegno: member.regno }, { receiverRegno: member.regno }] },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    safeFindMany(prisma.gpgSubscription, {
      where: { regno: member.regno },
      orderBy: { subscribedAt: "desc" },
      take: 12,
    }),
    safeFindMany(prisma.rankChallenge, {
      where: { regno: member.regno },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    safeFindMany(prisma.rankHistory, {
      where: { regno: member.regno },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    safeFindMany(prisma.commission, {
      where: { earnerRegno: member.regno },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    currentRank: member.rank?.rankName || "Member",
    rankPercent: member.rank?.percentage || 0,
    rank38AchievedAt: member.rank38AchievedAt || null,
    licenses: {
      totalConfigurablePool: Number(member.licensesRemaining || 0) + licenseHistory.filter((item) => item.giverRegno === member.regno).length,
      remaining: member.licensesRemaining || 0,
      history: licenseHistory,
    },
    gpg: {
      available: Number(member.rank?.percentage || 0) === 38,
      subscriptions: gpgSubscriptions,
    },
    rankChallenges,
    rankHistory,
    recentCommissions,
  };
};

export const dashboard = async (user) => {
  const member = await memberByToken(user);
  const now = new Date();
  const currentMonth = monthRange(now);
  const previousMonth = monthRange(now, -1);
  const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const directMembers = await prisma.member.findMany({
    where: { sponsorId: member.regno },
    include: {
      rank: true,
      panVerification: true,
      orders: {
        where: {
          approvedStatus: 1,
          saleDate: { gte: currentMonth.start, lt: currentMonth.end },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const downlineTotal = await prisma.downlineBusiness.aggregate({
    where: { regno: member.regno },
    _sum: { businessAmount: true },
  });
  const commissionTotals = await prisma.commission.aggregate({
    where: { earnerRegno: member.regno },
    _sum: { amount: true },
  });
  const pendingPayout = await prisma.payout.aggregate({
    where: { regno: member.regno, status: 0 },
    _sum: { netAmount: true },
  });
  const distributedPayout = await prisma.payout.aggregate({
    where: { regno: member.regno, status: 1 },
    _sum: { netAmount: true },
  });
  const [
    balance,
    selfPv,
    currentMonthEarnings,
    previousMonthEarnings,
    previousMonthDirectTeam,
    recentCommissions,
    commissionBreakdown,
  ] = await Promise.all([
    walletBalance(member.regno),
    prisma.order.aggregate({
      where: {
        regno: member.regno,
        approvedStatus: 1,
        saleDate: { gte: currentMonth.start, lt: currentMonth.end },
      },
      _sum: { pv: true, bv: true },
    }),
    prisma.commission.aggregate({
      where: { earnerRegno: member.regno, createdAt: { gte: currentMonth.start, lt: currentMonth.end } },
      _sum: { amount: true },
    }),
    prisma.commission.aggregate({
      where: { earnerRegno: member.regno, createdAt: { gte: previousMonth.start, lt: previousMonth.end } },
      _sum: { amount: true },
    }),
    prisma.member.count({
      where: {
        sponsorId: member.regno,
        createdAt: { gte: previousMonth.start, lt: previousMonth.end },
      },
    }),
    prisma.commission.findMany({
      where: { earnerRegno: member.regno, createdAt: { gte: sevenMonthsAgo } },
      orderBy: { createdAt: "asc" },
      select: { amount: true, createdAt: true },
    }),
    prisma.commission.groupBy({
      by: ["type"],
      where: { earnerRegno: member.regno },
      _sum: { amount: true },
    }),
  ]);
  const monthlyEarnings = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 6 + index, 1);
    return { month: monthKey(date), earnings: 0 };
  });
  const monthlyByLabel = new Map(monthlyEarnings.map((item) => [item.month, item]));
  recentCommissions.forEach((commission) => {
    const label = monthKey(new Date(commission.createdAt));
    const bucket = monthlyByLabel.get(label);
    if (bucket) bucket.earnings += money(commission.amount);
  });
  const topDirectMembers = directMembers
    .map((item) => ({
      ...toPublicMember(item),
      monthlyPv: item.orders.reduce((sum, order) => sum + money(order.pv ?? order.bv), 0),
      monthlyBusiness: item.orders.reduce((sum, order) => sum + money(order.bv ?? order.totalAmount), 0),
    }))
    .sort((a, b) => b.monthlyBusiness - a.monthlyBusiness)
    .slice(0, 5);
  const breakdownTones = ["gold", "emerald", "rose", "ink"];
  const earningsBreakdown = commissionBreakdown.map((item, index) => ({
    label: item.type,
    value: money(item._sum.amount),
    tone: breakdownTones[index % breakdownTones.length],
  }));
  const directTeamCurrentMonth = directMembers.filter((item) => {
    const createdAt = new Date(item.createdAt);
    return createdAt >= currentMonth.start && createdAt < currentMonth.end;
  }).length;

  return {
    user: toPublicMember(member),
    stats: {
      walletBalance: balance,
      totalEarnings: money(commissionTotals._sum.amount),
      totalWithdrawn: money(distributedPayout._sum.netAmount),
      pendingWithdrawal: money(pendingPayout._sum.netAmount),
      directTeam: directMembers.length,
      totalTeamBusiness: money(downlineTotal._sum.businessAmount),
      myPv: money(selfPv._sum.pv ?? selfPv._sum.bv),
      totalTeamPv: money(downlineTotal._sum.businessAmount),
      currentRank: member.rank?.rankName || "Member",
      earningsGrowth: percentageChange(money(currentMonthEarnings._sum.amount), money(previousMonthEarnings._sum.amount)),
      directTeamGrowth: percentageChange(directTeamCurrentMonth, previousMonthDirectTeam),
    },
    recentReferrals: directMembers.map(toPublicMember),
    topDirectMembers,
    monthlyEarnings,
    earningsBreakdown,
    recentPayouts: member.payouts.slice(0, 5),
    recentOrders: member.orders.slice(0, 5),
    licenses: member.pinsTransferredTo.map((transfer) => ({
      id: transfer.id,
      transferDate: transfer.transferDate,
      pinNo: transfer.pin?.pinNo,
      pinValue: transfer.pin?.pinValue,
      planName: transfer.pin?.plan?.planName,
      used: Boolean(transfer.pin?.usedStatus),
      usedDate: transfer.pin?.usage?.usedDate,
      usedByRegno: transfer.pin?.usage?.usedByRegno,
      usedForRegno: transfer.pin?.usage?.usedForRegno,
    })),
    announcements: await prisma.dashboardMessage.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    mlm: await mlmSummary(user),
  };
};

export const wallet = async (user) => {
  const member = await memberByToken(user);
  const ledger = await prisma.walletLedger.findMany({
    where: { regno: member.regno },
    orderBy: { createdAt: "desc" },
  });
  const pending = member.payouts.filter((payout) => payout.status === 0);
  const distributed = member.payouts.filter((payout) => payout.status === 1);
  const commissionTotals = await prisma.commission.aggregate({
    where: { earnerRegno: member.regno },
    _sum: { amount: true },
  });
  const totalEarnings = money(commissionTotals._sum.amount);
  const pendingWithdrawal = pending.reduce((sum, payout) => sum + money(payout.netAmount), 0);
  const totalWithdrawn = distributed.reduce((sum, payout) => sum + money(payout.netAmount), 0);

  const payoutTransactions = member.payouts.map((payout) => ({
    id: `PO${payout.id}`,
    date: payout.paymentDate || payout.createdAt,
    type: payout.status === 1 ? "Payout Distributed" : "Payout Pending",
    amount: payout.status === 1 ? -money(payout.netAmount) : money(payout.netAmount),
    status: payout.status === 1 ? "Processed" : "Pending",
  }));

  return {
    summary: {
      balance: await walletBalance(member.regno),
      totalEarnings,
      totalWithdrawn,
      pendingWithdrawal,
    },
    transactions: [
      ...ledger.map((item) => ({
        id: item.referenceId || `WL${item.id}`,
        date: item.createdAt,
        type: item.description || item.type,
        amount: money(item.amount),
        status: "Completed",
      })),
      ...payoutTransactions,
    ].sort((a, b) => new Date(b.date) - new Date(a.date)),
  };
};

export const payouts = async (user) => {
  const member = await memberByToken(user);
  return {
    items: member.payouts,
    summary: {
      totalAmount: member.payouts.reduce((sum, payout) => sum + money(payout.totalAmount), 0),
      tds: member.payouts.reduce((sum, payout) => sum + money(payout.tds), 0),
      netAmount: member.payouts.reduce((sum, payout) => sum + money(payout.netAmount), 0),
    },
  };
};

export const createWithdrawal = async (user, data) => {
  const member = await memberByToken(user);
  const amount = money(data.amount);
  if (amount <= 0) {
    const error = new Error("Withdrawal amount must be greater than zero");
    error.status = 400;
    throw error;
  }
  const balance = await walletBalance(member.regno);
  if (amount > balance) {
    const error = new Error("Withdrawal amount cannot exceed available wallet balance");
    error.status = 400;
    throw error;
  }

  return prisma.payout.create({
    data: {
      regno: member.regno,
      name: [member.firstName, member.lastName].filter(Boolean).join(" "),
      generationBonus: 0,
      levelBonus: 0,
      totalAmount: amount,
      tds: 0,
      adminCharge: 0,
      netAmount: amount,
      bankName: member.bankName,
      accountNo: member.accountNo,
      ifscCode: member.ifscCode,
      mobile: member.mobileNo,
      aadhaarNo: member.aadhaarNo,
      panNo: member.panNo,
      status: 0,
    },
  });
};

export const myCommissions = async (user, query = {}) => {
  const member = await memberByToken(user);
  return { items: await commissions(query, member.regno) };
};

export const network = async (user) => {
  const member = await memberByToken(user);
  const genealogy = await prisma.memberGenealogy.findMany({
    where: { ancestorRegno: member.regno, depth: { gt: 0 } },
    include: { descendant: { include: { rank: true } } },
    orderBy: [{ depth: "asc" }, { createdAt: "asc" }],
  });
  const descendants = genealogy.map((item) => item.descendant);
  const directMembers = descendants.filter((item) => item.sponsorId === member.regno);
  const childrenBySponsor = descendants.reduce((map, item) => {
    const children = map.get(item.sponsorId) || [];
    children.push(item);
    map.set(item.sponsorId, children);
    return map;
  }, new Map());
  const toTreeNode = (item) => ({
    id: item.regno,
    name: [item.firstName, item.lastName].filter(Boolean).join(" "),
    rank: item.rank?.rankName || "Member",
    children: (childrenBySponsor.get(item.regno) || []).map(toTreeNode),
  });
  const downlineBusiness = await prisma.downlineBusiness.findMany({
    where: { regno: member.regno },
    include: { downline: { include: { rank: true } } },
    orderBy: { id: "desc" },
  });
  const recentDirectMembers = await prisma.member.findMany({
    where: { regno: { in: directMembers.map((item) => item.regno) } },
    include: { rank: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    referralLink: `/register?ref=${member.regno}`,
    tree: {
      id: member.regno,
      name: [member.firstName, member.lastName].filter(Boolean).join(" "),
      rank: member.rank?.rankName || "Member",
      children: directMembers.map(toTreeNode),
    },
    directMembers: recentDirectMembers.map(toPublicMember),
    downline: downlineBusiness.map((item) => ({
      ...item,
      member: toPublicMember(item.downline),
    })),
  };
};

export const packages = async () => {
  const plans = await prisma.pinPlan.findMany({ orderBy: { pinValue: "asc" } });
  return plans.map((plan, index) => ({
    id: plan.id,
    name: plan.planName,
    price: money(plan.pinValue),
    pv: money(plan.pinValue) / 100,
    perks: ["Activation license", "Referral commission enabled", "Business tracking access"],
    popular: index === 0,
  }));
};

export const updateMyProfile = async (user, data) => {
  const member = await memberByToken(user);
  const profileFields = [
    "username",
    "firstName",
    "lastName",
    "aadhaarNo",
    "fatherName",
    "address",
    "city",
    "state",
    "country",
    "maritalStatus",
    "sex",
    "emailId",
    "mobileNo",
    "postalCode",
    "birthday",
    "bankName",
    "branch",
    "accountNo",
    "accountType",
    "ifscCode",
    "panNo",
    "accountHolderName",
    "nomineeName",
    "nomineeRelation",
  ];
  const payload = Object.fromEntries(
    profileFields
      .filter((key) => data[key] !== undefined)
      .map((key) => [key, key === "birthday" && data[key] ? new Date(data[key]) : data[key]])
  );
  const updated = await prisma.member.update({
    where: { regno: member.regno },
    data: payload,
    include: { rank: true, panVerification: true },
  });
  return toPublicMember(updated);
};

export const changeMyPassword = async (user, { oldPassword, newPassword }) => {
  if (!oldPassword || !newPassword) {
    const error = new Error("Old password and new password are required");
    error.status = 400;
    throw error;
  }
  if (String(newPassword).length < 6) {
    const error = new Error("New password must be at least 6 characters");
    error.status = 400;
    throw error;
  }

  const member = await prisma.member.findUnique({ where: { id: Number(user.id) } });
  if (!member) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }
  if (!(await passwordMatches(oldPassword, member.password))) {
    const error = new Error("Old password is incorrect");
    error.status = 400;
    throw error;
  }

  const password = await bcrypt.hash(newPassword, 10);
  await prisma.member.update({ where: { id: member.id }, data: { password } });
  return { message: "Password changed successfully" };
};

export const submitKyc = async (user, data) => {
  const member = await memberByToken(user);

  const updatedMember = await prisma.member.update({
    where: { regno: member.regno },
    data: {
      panNo: data.panNo || member.panNo,
      aadhaarNo: data.aadhaarNo || member.aadhaarNo,
    },
  });

  const pan = await prisma.panVerification.upsert({
    where: { memberId: member.id },
    update: {
      panNo: data.panNo || updatedMember.panNo,
      panImage: data.panImage,
      status: "Pending",
      verifiedBy: null,
      verifiedDate: null,
    },
    create: {
      memberId: member.id,
      panNo: data.panNo || updatedMember.panNo,
      panImage: data.panImage,
      status: "Pending",
    },
  });

  return { member: updatedMember, panVerification: pan };
};

export const orders = async (user) => {
  const member = await memberByToken(user);
  return { items: member.orders, transactions: member.onlineTransactions };
};
