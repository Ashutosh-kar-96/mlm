import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import { dateRange, pagination } from "../utils/query.js";
import { logAudit } from "./audit.service.js";
import { createMemberGenealogy, validateSponsor, walletBalance } from "./mlm.service.js";

const memberInclude = {
  rank: true,
  panVerification: true,
};

const withoutPassword = (member) => {
  if (!member) return member;
  const { password, ...safeMember } = member;
  return safeMember;
};

const statusMap = {
  unpaid: 0,
  active: 1,
  blocked: 2,
};

const buildMemberWhere = (query, forcedStatus) => ({
  ...(forcedStatus !== undefined ? { status: forcedStatus } : {}),
  ...(query.q ? {
    OR: [
      { regno: { contains: query.q } },
      { username: { contains: query.q } },
      { firstName: { contains: query.q } },
      { lastName: { contains: query.q } },
      { mobileNo: { contains: query.q } },
      { emailId: { contains: query.q } },
    ],
  } : {}),
  ...(query.regno ? { regno: { contains: query.regno } } : {}),
  ...(query.mobile ? { mobileNo: { contains: query.mobile } } : {}),
  ...(query.sponsorId ? { sponsorId: { contains: query.sponsorId } } : {}),
  ...(query.rankName ? { rank: { rankName: { contains: query.rankName } } } : {}),
  ...dateRange("doj", query.fromDate, query.toDate),
});

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

const memberCreateError = (error) => {
  if (error.code === "P2002") {
    const field = error.meta?.target?.join?.(", ") || "member field";
    const next = new Error(`A member with this ${field} already exists.`);
    next.status = 400;
    return next;
  }
  if (error.code === "P2003") {
    const next = new Error("Sponsor or linked member record is invalid.");
    next.status = 400;
    return next;
  }
  return error;
};

export const listMembers = async (query, type) => {
  const { skip, take, page, limit } = pagination(query);
  const where = buildMemberWhere(query, statusMap[type]);

  const [items, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take,
      include: memberInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.member.count({ where }),
  ]);

  return { items: items.map(withoutPassword), meta: { page, limit, total } };
};

export const getMember = async (regno) => {
  const member = await prisma.member.findUnique({
    where: { regno },
    include: {
      rank: true,
      panVerification: true,
      orders: { orderBy: { saleDate: "desc" }, take: 10 },
      onlineTransactions: { orderBy: { txnDate: "desc" }, take: 10 },
      payouts: { orderBy: { createdAt: "desc" }, take: 10 },
      pinsTransferredTo: { orderBy: { transferDate: "desc" }, take: 10, include: { pin: true } },
      rankHistories: { orderBy: { createdAt: "desc" }, take: 20 },
      commissionsEarned: { orderBy: { createdAt: "desc" }, take: 20 },
      licensesGiven: { orderBy: { createdAt: "desc" }, take: 20 },
      licensesReceived: { orderBy: { createdAt: "desc" }, take: 5 },
      gpgSubscriptions: { orderBy: { subscribedAt: "desc" }, take: 12 },
      rankChallenges: { orderBy: { createdAt: "desc" }, take: 5 },
      walletLedgers: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!member) return member;

  return {
    ...withoutPassword(member),
    walletBalance: await walletBalance(regno),
  };
};

export const createMember = async (data) => {
  if (!data.firstName) {
    const error = new Error("First name is required");
    error.status = 400;
    throw error;
  }
  if (!data.password || String(data.password).length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.status = 400;
    throw error;
  }
  const password = data.password ? await bcrypt.hash(data.password, 10) : undefined;
  let member;
  try {
    await validateSponsor(data.sponsorId);
    member = await prisma.$transaction(async (tx) => {
      const freeSignupRank = data.rankId ? null : await tx.rank.findFirst({
        where: {
          rankName: "Free Signup",
          OR: [{ percentage: 10 }, { percentage: 0 }],
        },
        select: { id: true },
      });
      const created = await tx.member.create({
        data: {
          regno: data.regno || await nextRegno(),
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          password,
          sponsorId: data.sponsorId,
          rankId: data.rankId ?? freeSignupRank?.id,
          aadhaarNo: data.aadhaarNo,
          fatherName: data.fatherName,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          maritalStatus: data.maritalStatus,
          sex: data.sex,
          emailId: data.emailId,
          mobileNo: data.mobileNo,
          postalCode: data.postalCode,
          birthday: data.birthday ? new Date(data.birthday) : undefined,
          bankName: data.bankName,
          branch: data.branch,
          accountNo: data.accountNo,
          accountType: data.accountType,
          ifscCode: data.ifscCode,
          panNo: data.panNo,
          accountHolderName: data.accountHolderName,
          nomineeName: data.nomineeName,
          nomineeRelation: data.nomineeRelation,
          doj: data.doj ? new Date(data.doj) : new Date(),
          paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
          planAmount: data.planAmount ?? 0,
          status: data.status ?? 0,
          loginFlag: data.loginFlag ?? false,
        },
      });
      await createMemberGenealogy(created, tx);
      return created;
    });
  } catch (error) {
    throw memberCreateError(error);
  }

  if (data.panNo || data.panImage) {
    await prisma.panVerification.create({
      data: {
        memberId: member.id,
        panNo: data.panNo,
        panImage: data.panImage,
      },
    });
  }

  return member;
};

export const updateMember = async (regno, data) => {
  const member = await prisma.member.findUnique({ where: { regno } });
  if (!member) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }

  if (data.sponsorId !== undefined && data.sponsorId !== member.sponsorId) {
    const error = new Error("Sponsor cannot be changed after member creation");
    error.status = 400;
    throw error;
  }

  const { password, ...profileData } = data;
  const nextPassword = password ? await bcrypt.hash(password, 10) : undefined;

  return prisma.member.update({
    where: { regno },
    data: {
      ...profileData,
      ...(nextPassword ? { password: nextPassword } : {}),
      birthday: profileData.birthday ? new Date(profileData.birthday) : undefined,
      doj: profileData.doj ? new Date(profileData.doj) : undefined,
      paidDate: profileData.paidDate ? new Date(profileData.paidDate) : undefined,
    },
    include: memberInclude,
  }).then(withoutPassword);
};

export const setStatus = async (regno, status, adminId) => {
  const member = await prisma.member.update({
    where: { regno },
    data: {
      status,
      ...(status === 1 ? { paidDate: new Date(), loginFlag: true } : {}),
      ...(status === 2 ? { loginFlag: false } : {}),
    },
  });
  await logAudit(adminId, status === 2 ? "member.block" : "member.status", "Member", regno, { status });
  return member;
};

export const creditWallet = async (regno, data = {}, adminId) => {
  const amount = Number(data.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error("Amount must be greater than zero");
    error.status = 400;
    throw error;
  }

  const member = await prisma.member.findUnique({ where: { regno } });
  if (!member) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }

  const remarks = String(data.remarks || "").trim();
  const referenceId = `admin_credit_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  return prisma.$transaction(async (tx) => {
    const balance = await walletBalance(regno, tx);
    const ledger = await tx.walletLedger.create({
      data: {
        regno,
        type: "Credit",
        description: remarks ? `Admin wallet credit - ${remarks}` : "Admin wallet credit",
        amount,
        balance: balance + amount,
        referenceId,
      },
    });

    await logAudit(adminId, "wallet.credit", "Member", regno, {
      amount,
      referenceId,
      remarks: remarks || undefined,
      balance: balance + amount,
    }, tx);

    return { ledger, balance: balance + amount };
  });
};

export const getDownline = async (regno, query) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ancestorRegno: regno,
    depth: { gt: 0 },
    ...(query.memberRegno ? { descendantRegno: { contains: query.memberRegno } } : {}),
  };

  const [genealogy, total, business] = await Promise.all([
    prisma.memberGenealogy.findMany({
      where,
      skip,
      take,
      include: { descendant: { include: { rank: true } } },
      orderBy: [{ depth: "asc" }, { createdAt: "desc" }],
    }),
    prisma.memberGenealogy.count({ where }),
    prisma.downlineBusiness.groupBy({
      by: ["downlineRegno"],
      where: {
        regno,
        ...dateRange("fromDate", query.fromDate, query.toDate),
      },
      _sum: { businessAmount: true },
    }),
  ]);
  const businessByRegno = new Map(business.map((item) => [item.downlineRegno, item._sum.businessAmount || 0]));
  const items = genealogy.map((item) => ({
    id: item.id,
    regno,
    downlineRegno: item.descendantRegno,
    depth: item.depth,
    businessAmount: businessByRegno.get(item.descendantRegno) || 0,
    fromDate: null,
    toDate: null,
    downline: item.descendant,
  }));

  return { items, meta: { page, limit, total } };
};

export const poolMembers = (rankName, query) =>
  listMembers({ ...query, rankName }, undefined);

export const listRanks = () =>
  prisma.rank.findMany({
    where: { percentage: { not: null } },
    orderBy: [{ levelNo: "asc" }, { id: "asc" }],
  });
