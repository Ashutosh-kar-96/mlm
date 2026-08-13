import prisma from "../config/db.js";
import { dateRange } from "../utils/query.js";

const NEWCOMER_SINGLE_ORDER_LIMIT = 10000;
const RANK_LICENSE_GRANTS = new Map([
  [24, 10],
  [29, 10],
]);
const DIRECT_RANK_LABELS = [10, 14, 19, 24, 29, 38, 41];
const GPG_RANK_LABEL = 38;
const RANK_41_LABEL = 41;
const GPG_SEQUENCE = [7, 4.5, 3, 2, 1];
const RANK_41_GPG_SEQUENCE = [8.25, 6.25, 4.5, 2.5, 1];
const RANK_41_REQUIRED_BV = 1490000;
const RANK_41_CHALLENGE_MONTHS = 3;

export const SHOPPING_PROMOTION_THRESHOLDS = [
  { threshold: 38000, targetRank: 29, route: "SHOPPING_38000" },
  { threshold: 22500, targetRank: 24, route: "SHOPPING_22500" },
  { threshold: 9000, targetRank: 19, route: "SHOPPING_9000" },
  { threshold: 4500, targetRank: 14, route: "SHOPPING_4500" },
];

const DEFAULT_COMMISSION_PLAN = [
  { rankLabel: 10, baseRate: 10, monthlyCap: null },
  { rankLabel: 14, baseRate: 4, monthlyCap: 4500 },
  { rankLabel: 19, baseRate: 9, monthlyCap: 9000 },
  { rankLabel: 24, baseRate: 24, monthlyCap: null },
  { rankLabel: 29, baseRate: 29, monthlyCap: null },
  { rankLabel: 38, baseRate: 38, monthlyCap: null },
  { rankLabel: 41, baseRate: 41, monthlyCap: null },
];

const DEFAULT_GROUP_INCENTIVE_PLAN = [
  {
    rankPercent: 38,
    generations: [7, 4.5, 3, 2, 1],
    enabled: true,
    base: "SPECIAL_DIFFERENTIAL_APPROVED_SUBSCRIPTION",
  },
  {
    rankPercent: 41,
    generations: [8.25, 6.25, 4.5, 2.5, 1],
    enabled: true,
    base: "SPECIAL_DIFFERENTIAL_APPROVED_SUBSCRIPTION",
  },
];

const DEFAULT_RANK_LEG_RULES = [];

const money = (value) => Number(value || 0);
const activationOrderId = () => `ACT${Date.now().toString().slice(-10)}`;
const activationTxnId = (pinNo) => `pin_activation_${pinNo}`;

export const validateSponsor = async (sponsorId, client = prisma) => {
  if (!sponsorId) return null;

  const sponsor = await client.member.findUnique({ where: { regno: sponsorId } });
  if (!sponsor) {
    const error = new Error("Sponsor ID is invalid");
    error.status = 400;
    throw error;
  }

  if (sponsor.status === 2) {
    const error = new Error("Sponsor account is blocked");
    error.status = 400;
    throw error;
  }

  return sponsor;
};

export const createMemberGenealogy = async (member, client = prisma) => {
  await client.memberGenealogy.upsert({
    where: {
      ancestorRegno_descendantRegno: {
        ancestorRegno: member.regno,
        descendantRegno: member.regno,
      },
    },
    update: { depth: 0 },
    create: {
      ancestorRegno: member.regno,
      descendantRegno: member.regno,
      depth: 0,
    },
  });

  if (!member.sponsorId) return;

  const sponsorAncestors = await client.memberGenealogy.findMany({
    where: { descendantRegno: member.sponsorId },
    orderBy: { depth: "asc" },
  });

  for (const ancestor of sponsorAncestors) {
    await client.memberGenealogy.upsert({
      where: {
        ancestorRegno_descendantRegno: {
          ancestorRegno: ancestor.ancestorRegno,
          descendantRegno: member.regno,
        },
      },
      update: { depth: ancestor.depth + 1 },
      create: {
        ancestorRegno: ancestor.ancestorRegno,
        descendantRegno: member.regno,
        depth: ancestor.depth + 1,
      },
    });
  }
};

export const walletBalance = async (regno, client = prisma) => {
  const ledger = await client.walletLedger.aggregate({
    where: { regno },
    _sum: { amount: true },
  });
  const withdrawals = await client.payout.aggregate({
    where: { regno },
    _sum: { netAmount: true },
  });
  return money(ledger._sum.amount) - money(withdrawals._sum.netAmount);
};

export const assertNewcomerOrderLimit = (member, orderAmount) => {
  if (rankPercent(member?.rank) !== 10 || money(orderAmount) <= NEWCOMER_SINGLE_ORDER_LIMIT) return;

  const error = new Error("Newcomer single order amount cannot exceed ₹10,000");
  error.status = 400;
  throw error;
};

export const commissionPlan = async (client = prisma) => {
  const setting = await client.mlmSetting.findUnique({ where: { keyName: "commission_plan" } });
  if (!setting) return DEFAULT_COMMISSION_PLAN;

  try {
    const parsed = JSON.parse(setting.valueJson);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_COMMISSION_PLAN;
  } catch {
    return DEFAULT_COMMISSION_PLAN;
  }
};

export const groupIncentivePlan = async (client = prisma) => {
  const setting = await client.mlmSetting.findUnique({ where: { keyName: "group_incentive_plan" } });
  if (!setting) return DEFAULT_GROUP_INCENTIVE_PLAN;

  try {
    const parsed = JSON.parse(setting.valueJson);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_GROUP_INCENTIVE_PLAN;
  } catch {
    return DEFAULT_GROUP_INCENTIVE_PLAN;
  }
};

export const rankLegRules = async (client = prisma) => {
  const setting = await client.mlmSetting.findUnique({ where: { keyName: "rank_leg_rules" } });
  if (!setting) return DEFAULT_RANK_LEG_RULES;

  try {
    const parsed = JSON.parse(setting.valueJson);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_RANK_LEG_RULES;
  } catch {
    return DEFAULT_RANK_LEG_RULES;
  }
};

export const sponsorChain = async (member, depth, client = prisma) => {
  const chain = [];
  let sponsorId = member.sponsorId;

  for (let level = 1; level <= depth && sponsorId; level += 1) {
    const sponsor = await client.member.findUnique({
      where: { regno: sponsorId },
      include: { rank: true },
    });
    if (!sponsor) break;
    chain.push({ level, member: sponsor });
    sponsorId = sponsor.sponsorId;
  }

  return chain;
};

const rankPercent = (rank) => money(rank?.percentage);
const rankBaseRate = (rank) => money(rank?.baseRate ?? rank?.percentage);
const rankMonthlyCap = (rank) => (rank?.monthlyCap === null || rank?.monthlyCap === undefined ? null : money(rank.monthlyCap));

const periodRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};

const capPeriodSetting = async (client) => {
  const setting = await client.mlmSetting.findUnique({ where: { keyName: "rank_cap_period" } });
  if (!setting) return "MONTHLY";
  try {
    const parsed = JSON.parse(setting.valueJson);
    return parsed?.period || "MONTHLY";
  } catch {
    return "MONTHLY";
  }
};

export const cycleKey = (date = new Date()) => {
  const value = new Date(date);
  const start = new Date(value);
  if (value.getDate() < 20) {
    start.setMonth(start.getMonth() - 1);
  }
  start.setDate(20);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-20`;
};

export const cycleRange = (key = cycleKey()) => {
  const [year, month] = String(key).split("-").map(Number);
  const start = new Date(year, month - 1, 20, 0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(19);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const directPlanMap = (plan = DEFAULT_COMMISSION_PLAN) =>
  new Map((Array.isArray(plan) ? plan : DEFAULT_COMMISSION_PLAN).map((item) => [money(item.rankLabel), item]));

const directRankLabels = (plan = DEFAULT_COMMISSION_PLAN) =>
  [...directPlanMap(plan).keys()].filter((label) => Number.isFinite(label));

const directBaseRate = (rank, planMap = directPlanMap()) => {
  const label = rankPercent(rank);
  const configured = planMap.get(label);
  if (configured?.baseRate !== undefined && configured?.baseRate !== null) return money(configured.baseRate);
  return rankBaseRate(rank);
};

const isDirectRank = (rank, plan = DEFAULT_COMMISSION_PLAN) => directRankLabels(plan).includes(rankPercent(rank));
const licenseReferenceId = ({ giverRegno, recipientRegno }) => `license:${giverRegno}:${recipientRegno}`;

export const calculateDirectRankEntries = (chain = [], plan = DEFAULT_COMMISSION_PLAN) => {
  const entries = [];
  let highestRankBelow = null;
  const planMap = directPlanMap(plan);
  const labels = directRankLabels(plan);

  for (const sponsor of chain) {
    const label = rankPercent(sponsor.member.rank);
    if (!labels.includes(label)) continue;

    if (highestRankBelow === null) {
      entries.push({
        ...sponsor,
        percentage: directBaseRate(sponsor.member.rank, planMap),
        reasonCode: "DIRECT_BASE_RATE",
        rankLabel: label,
        lowerRankLabel: null,
      });
      highestRankBelow = label;
      continue;
    }

    if (label > highestRankBelow) {
      entries.push({
        ...sponsor,
        percentage: label - highestRankBelow,
        reasonCode: "DIRECT_RANK_DIFFERENCE",
        rankLabel: label,
        lowerRankLabel: highestRankBelow,
      });
      highestRankBelow = label;
      continue;
    }

    entries.push({
      ...sponsor,
      percentage: 0,
      reasonCode: label === highestRankBelow ? "SAME_AS_HIGHEST_RANK" : "LOWER_THAN_HIGHEST_RANK",
      rankLabel: label,
      lowerRankLabel: highestRankBelow,
    });
  }

  return entries;
};

export const calculateGpgEntries = (chain = [], eligibilityByRegno = new Map(), sequence = GPG_SEQUENCE, rankLabel = GPG_RANK_LABEL) => {
  const lowestSpecialRankIndex = chain.findIndex((sponsor) => rankPercent(sponsor.member.rank) === rankLabel);
  if (lowestSpecialRankIndex < 0) return [];

  const entries = [];

  for (let index = lowestSpecialRankIndex + 1; index < chain.length; index += 1) {
    const sponsor = chain[index];
    if (rankPercent(sponsor.member.rank) !== rankLabel) continue;

    const eligibility = eligibilityByRegno.get(sponsor.member.regno) || {};
    if (!eligibility.subscribed) {
      entries.push({ ...sponsor, percentage: 0, gpgSlot: null, reasonCode: "GPG_NOT_SUBSCRIBED", subscription: eligibility.subscription || null });
      continue;
    }
    if (!eligibility.approved) {
      entries.push({ ...sponsor, percentage: 0, gpgSlot: null, reasonCode: "GPG_NOT_APPROVED", subscription: eligibility.subscription || null });
      continue;
    }
    const assignedSlot = Number(eligibility.subscription?.accessNumber || 0);
    const assignedPercentage = money(eligibility.subscription?.accessPercentage);
    if (assignedSlot < 1 || assignedSlot > sequence.length || assignedPercentage <= 0) {
      entries.push({ ...sponsor, percentage: 0, gpgSlot: null, reasonCode: `RANK_${rankLabel}_SPECIAL_SLOT_OVER_LIMIT`, subscription: eligibility.subscription || null });
      continue;
    }

    entries.push({
      ...sponsor,
      percentage: assignedPercentage,
      gpgSlot: assignedSlot,
      reasonCode: "GPG_APPROVED",
      subscription: eligibility.subscription || null,
    });
  }

  return entries;
};

const remainingMonthlyCap = async (member, rank, date, client) => {
  const cap = rankMonthlyCap(rank);
  if (cap === null) return null;
  const capPeriod = await capPeriodSetting(client);
  if (capPeriod === "NONE") return null;
  if (capPeriod === "PER_ORDER") return cap;
  const { start, end } = periodRange(date);
  const earned = await client.commission.aggregate({
    where: {
      earnerRegno: member.regno,
      createdAt: { gte: start, lt: end },
      type: { in: ["Direct Differential", "Rank Differential"] },
    },
    _sum: { amount: true },
  });
  return Math.max(0, cap - money(earned._sum.amount));
};

const latestRankReachedAt = async (regno, rank, client) => {
  const history = await client.rankHistory.findFirst({
    where: { regno, newRankId: rank.id },
    orderBy: { createdAt: "desc" },
  });
  return history?.createdAt;
};

const challengeWindowBusiness = async (regno, since, months, client) => {
  if (!since || !months) return 0;
  const until = new Date(since);
  until.setMonth(until.getMonth() + Number(months));
  const now = new Date();
  const toDate = now < until ? now : until;

  const [selfBusiness, downlineBusiness] = await Promise.all([
    client.order.aggregate({
      where: { regno, approvedStatus: 1, saleDate: { gte: since, lte: toDate } },
      _sum: { bv: true },
    }),
    client.downlineBusiness.aggregate({
      where: { regno, fromDate: { gte: since, lte: toDate } },
      _sum: { businessAmount: true },
    }),
  ]);

  return money(selfBusiness._sum.bv) + money(downlineBusiness._sum.businessAmount);
};

export const grantRankLicenses = async (member, rank, client = prisma) => {
  const label = rankPercent(rank);
  const grantAmount = RANK_LICENSE_GRANTS.get(label);
  if (!grantAmount) return;

  const previousGrant = await client.auditLog.count({
    where: {
      action: "rank.licenseGrant",
      entityType: "Member",
      entityId: member.regno,
      detailsJson: { contains: `"rankLabel":${label}` },
    },
  });
  if (previousGrant > 0) return;

  const usedCount = await client.licenseUsage.count({ where: { giverRegno: member.regno } });
  const totalPool = Number(member.licensesRemaining || 0) + usedCount;
  if (label === 24 && totalPool >= 10) return;
  if (label === 29 && totalPool >= 20) return;

  await client.member.update({
    where: { regno: member.regno },
    data: { licensesRemaining: { increment: grantAmount } },
  });
  await client.auditLog.create({
    data: {
      action: "rank.licenseGrant",
      entityType: "Member",
      entityId: member.regno,
      detailsJson: JSON.stringify({
        rankLabel: label,
        grantAmount,
        reason: `Rank ${label} license grant`,
      }),
    },
  });
};

export const initializeRank38Facilities = async (member, achievedAt = new Date(), client = prisma) => {
  await client.member.updateMany({
    where: { regno: member.regno, rank38AchievedAt: null },
    data: { rank38AchievedAt: achievedAt },
  });

  const endsAt = new Date(achievedAt);
  endsAt.setMonth(endsAt.getMonth() + RANK_41_CHALLENGE_MONTHS);
  await client.rankChallenge.upsert({
    where: {
      regno_challengeType_startedAt: {
        regno: member.regno,
        challengeType: "RANK_41",
        startedAt: achievedAt,
      },
    },
    update: {},
    create: {
      regno: member.regno,
      challengeType: "RANK_41",
      status: "Active",
      startedAt: achievedAt,
      endsAt,
      requiredBv: RANK_41_REQUIRED_BV,
      currentBv: 0,
      metadataJson: JSON.stringify({ reason: "RANK_38_ACHIEVED" }),
    },
  });
};

const rankByLabel = async (label, client) =>
  client.rank.findFirst({ where: { percentage: label } });

const directLegs = async (regno, client) =>
  client.member.findMany({
    where: { sponsorId: regno, status: { not: 2 } },
    include: { rank: true },
    orderBy: { createdAt: "asc" },
  });

const directRankCounts = (legs) =>
  legs.reduce((counts, leg) => {
    const label = rankPercent(leg.rank);
    counts.set(label, (counts.get(label) || 0) + 1);
    return counts;
  }, new Map());

const directRankMembers = (legs, label) =>
  legs.filter((leg) => rankPercent(leg.rank) === label).map((leg) => leg.regno);

const hasDirectRankCount = (counts, label, count) => (counts.get(label) || 0) >= count;
const hasCurrentRank = (member, label) => rankPercent(member.rank) === label;

export const qualifiesForRank24By14Structure = ({ member, counts }) =>
  hasCurrentRank(member, 14) && hasDirectRankCount(counts, 14, 4);

export const qualifiesForRank29By19Structure = ({ member, counts }) =>
  hasCurrentRank(member, 19) && hasDirectRankCount(counts, 19, 4);

export const qualifiesForRank38RouteA = ({ member, counts }) =>
  hasCurrentRank(member, 24) && hasDirectRankCount(counts, 24, 4);

export const qualifiesForRank38RouteB = ({ member, counts }) =>
  hasCurrentRank(member, 19) && hasDirectRankCount(counts, 24, 4);

export const qualifiesForRank38RouteC = ({ member, counts }) =>
  hasCurrentRank(member, 19) && hasDirectRankCount(counts, 29, 4);

export const qualifiesForRank38RouteD = ({ member, counts }) =>
  hasCurrentRank(member, 29)
  && hasDirectRankCount(counts, 24, 1)
  && hasDirectRankCount(counts, 29, 1)
  && hasDirectRankCount(counts, 19, 1);

export const qualifiesForRank38RouteE = async ({ member, legs, client = prisma }) => {
  if (!hasCurrentRank(member, 29)) return { qualifies: false, intermediateRegno: null, childRank29Regnos: [] };

  const rank19Directs = legs.filter((leg) => rankPercent(leg.rank) === 19);
  for (const rank19 of rank19Directs) {
    const children = await directLegs(rank19.regno, client);
    const childRank29Regnos = directRankMembers(children, 29);
    if (childRank29Regnos.length >= 3) {
      return {
        qualifies: true,
        intermediateRegno: rank19.regno,
        childRank29Regnos: childRank29Regnos.slice(0, 3),
      };
    }
  }

  return { qualifies: false, intermediateRegno: null, childRank29Regnos: [] };
};

export const qualifiesForRank41By38Structure = ({ member, counts }) =>
  hasCurrentRank(member, 38) && hasDirectRankCount(counts, 38, 4);

const qualifiesForRank41Challenge = async (member, client) => {
  const achievedAt = member.rank38AchievedAt || await latestRankReachedAt(member.regno, member.rank, client);
  const currentBv = await challengeWindowBusiness(member.regno, achievedAt, RANK_41_CHALLENGE_MONTHS, client);
  return {
    qualifies: currentBv >= RANK_41_REQUIRED_BV,
    currentBv,
    requiredBv: RANK_41_REQUIRED_BV,
    startedAt: achievedAt,
  };
};

const structuralRoutes = [
  {
    targetRank: 38,
    route: "STRUCTURE_24_4X24",
    qualifies: ({ member, counts }) => qualifiesForRank38RouteA({ member, counts }),
    snapshot: ({ legs }) => ({ directRank24: directRankMembers(legs, 24).slice(0, 4) }),
  },
  {
    targetRank: 38,
    route: "STRUCTURE_19_4X24",
    qualifies: ({ member, counts }) => qualifiesForRank38RouteB({ member, counts }),
    snapshot: ({ legs }) => ({ directRank24: directRankMembers(legs, 24).slice(0, 4) }),
  },
  {
    targetRank: 38,
    route: "STRUCTURE_19_4X29",
    qualifies: ({ member, counts }) => qualifiesForRank38RouteC({ member, counts }),
    snapshot: ({ legs }) => ({ directRank29: directRankMembers(legs, 29).slice(0, 4) }),
  },
  {
    targetRank: 38,
    route: "STRUCTURE_29_MIXED_24_29_19",
    qualifies: ({ member, counts }) => qualifiesForRank38RouteD({ member, counts }),
    snapshot: ({ legs }) => ({
      directRank24: directRankMembers(legs, 24).slice(0, 1),
      directRank29: directRankMembers(legs, 29).slice(0, 1),
      directRank19: directRankMembers(legs, 19).slice(0, 1),
    }),
  },
  {
    targetRank: 29,
    route: "STRUCTURE_19_4X19",
    qualifies: ({ member, counts }) => qualifiesForRank29By19Structure({ member, counts }),
    snapshot: ({ legs }) => ({ directRank19: directRankMembers(legs, 19).slice(0, 4) }),
  },
  {
    targetRank: 24,
    route: "STRUCTURE_14_4X14",
    qualifies: ({ member, counts }) => qualifiesForRank24By14Structure({ member, counts }),
    snapshot: ({ legs }) => ({ directRank14: directRankMembers(legs, 14).slice(0, 4) }),
  },
];

export const evaluateStructurePromotion = async (member, client = prisma) => {
  const legs = await directLegs(member.regno, client);
  const counts = directRankCounts(legs);
  const currentLabel = rankPercent(member.rank);

  if (currentLabel < 41 && qualifiesForRank41By38Structure({ member, counts })) {
    const challenge = await qualifiesForRank41Challenge(member, client);
    if (challenge.qualifies) {
      const targetRank = await rankByLabel(41, client);
      if (targetRank) {
        return {
          targetRank,
          reason: "DOWNLINE_STRUCTURE",
          route: "RANK_41_CHALLENGE",
          snapshot: {
            directRank38: directRankMembers(legs, 38).slice(0, 4),
            challenge,
            checkedDirectLegs: legs.map((leg) => ({ regno: leg.regno, rank: rankPercent(leg.rank) })),
          },
        };
      }
    }
  }

  const routeE = await qualifiesForRank38RouteE({ member, legs, client });
  if (currentLabel < 38 && routeE.qualifies) {
    const targetRank = await rankByLabel(38, client);
    if (targetRank) {
      return {
        targetRank,
        reason: "DOWNLINE_STRUCTURE",
        route: "STRUCTURE_29_VIA_19_3X29",
        snapshot: {
          directRank19: routeE.intermediateRegno,
          childRank29Regnos: routeE.childRank29Regnos,
          checkedDirectLegs: legs.map((leg) => ({ regno: leg.regno, rank: rankPercent(leg.rank) })),
        },
      };
    }
  }

  for (const route of structuralRoutes) {
    if (currentLabel >= route.targetRank) continue;
    if (!route.qualifies({ member, counts, legs })) continue;

    const targetRank = await rankByLabel(route.targetRank, client);
    if (!targetRank) continue;
    return {
      targetRank,
      reason: "DOWNLINE_STRUCTURE",
      route: route.route,
      snapshot: {
        ...route.snapshot({ legs }),
        checkedDirectLegs: legs.map((leg) => ({ regno: leg.regno, rank: rankPercent(leg.rank) })),
      },
    };
  }

  return null;
};

export const shoppingPromotionForTotal = (totalShopping) =>
  SHOPPING_PROMOTION_THRESHOLDS.find((item) => money(totalShopping) >= item.threshold) || null;

const evaluateShoppingPromotion = async (member, client = prisma) => {
  const currentLabel = rankPercent(member.rank);
  if (currentLabel >= 29) return null;

  const shopping = await client.order.aggregate({
    where: { regno: member.regno, approvedStatus: 1 },
    _sum: { totalAmount: true },
  });
  const totalShopping = money(shopping._sum.totalAmount);
  const promotion = shoppingPromotionForTotal(totalShopping);
  if (!promotion || promotion.targetRank <= currentLabel) return null;

  const targetRank = await rankByLabel(promotion.targetRank, client);
  if (!targetRank) return null;

  return {
    targetRank,
    reason: "SHOPPING",
    route: promotion.route,
    snapshot: {
      totalShopping,
      requiredShopping: promotion.threshold,
    },
  };
};

export const evaluateRankUpgrade = async (member, client = prisma) => {
  const currentLabel = rankPercent(member.rank);
  const candidates = await Promise.all([
    evaluateShoppingPromotion(member, client),
    evaluateStructurePromotion(member, client),
  ]);

  return candidates
    .filter((candidate) => candidate && rankPercent(candidate.targetRank) > currentLabel)
    .sort((a, b) => rankPercent(b.targetRank) - rankPercent(a.targetRank))[0] || null;
};

export const applyRankLicense = async ({ giverRegno, recipientRegno }, client = prisma) => {
  const run = async (tx) => {
    const [giver, recipient, rank14, previousUsage] = await Promise.all([
      tx.member.findUnique({ where: { regno: giverRegno }, include: { rank: true } }),
      tx.member.findUnique({ where: { regno: recipientRegno }, include: { rank: true } }),
      tx.rank.findFirst({ where: { percentage: 14 } }),
      tx.licenseUsage.findUnique({ where: { receiverRegno: recipientRegno } }),
    ]);

    if (!giver || !recipient || !rank14) {
      const error = new Error("License giver, recipient, or Rank 14 not found");
      error.status = 404;
      throw error;
    }
    if (rankPercent(giver.rank) < 24) {
      const error = new Error("Only Rank-24+ members can issue Rank-14 licenses");
      error.status = 400;
      throw error;
    }
    if (rankPercent(recipient.rank) >= 14 || previousUsage) {
      const error = new Error("License can only be applied once to a Free Rank-0 member");
      error.status = 400;
      throw error;
    }

    const decremented = await tx.member.updateMany({
      where: { regno: giver.regno, licensesRemaining: { gt: 0 } },
      data: { licensesRemaining: { decrement: 1 } },
    });
    if (decremented.count !== 1) {
      const error = new Error("No licenses remaining");
      error.status = 400;
      throw error;
    }

    const usedCount = await tx.licenseUsage.count({ where: { giverRegno: giver.regno } });
    const updatedRecipient = await tx.member.update({ where: { regno: recipient.regno }, data: { rankId: rank14.id } });
    await tx.licenseUsage.create({
      data: {
        giverRegno: giver.regno,
        giverRankAtTime: rankPercent(giver.rank),
        receiverRegno: recipient.regno,
        receiverPreviousRank: rankPercent(recipient.rank),
        receiverNewRank: 14,
        licenseSequence: usedCount + 1,
        referenceId: licenseReferenceId({ giverRegno: giver.regno, recipientRegno: recipient.regno }),
        metadataJson: JSON.stringify({ upgradeMethod: "LICENSE" }),
      },
    });
    await tx.rankHistory.create({
      data: {
        regno: recipient.regno,
        oldRankId: recipient.rankId,
        newRankId: rank14.id,
        oldRankName: recipient.rank?.rankName,
        newRankName: rank14.rankName,
        oldPercent: recipient.rank?.percentage ?? 0,
        newPercent: rank14.percentage ?? 14,
        promotionReason: "LICENSE",
        qualificationSnapshot: JSON.stringify({
          giverRegno: giver.regno,
          giverRankAtTime: rankPercent(giver.rank),
          licenseSequence: usedCount + 1,
          referenceId: licenseReferenceId({ giverRegno: giver.regno, recipientRegno: recipient.regno }),
        }),
      },
    });
    return updatedRecipient;
  };

  return typeof client.$transaction === "function" ? client.$transaction(run) : run(client);
};

export const updateRanksForMembers = async (regnos, adminId, client = prisma) => {
  const uniqueRegnos = [...new Set(regnos.filter(Boolean))];

  for (const regno of uniqueRegnos) {
    const member = await client.member.findUnique({ where: { regno }, include: { rank: true } });
    if (!member) continue;

    if (rankPercent(member.rank) >= 24) {
      await grantRankLicenses(member, member.rank, client);
    }
    if (rankPercent(member.rank) === 38) {
      await initializeRank38Facilities(member, member.rank38AchievedAt || new Date(), client);
    }

    const promotion = await evaluateRankUpgrade(member, client);
    if (promotion) {
      const promotedAt = new Date();
      await client.member.update({
        where: { regno },
        data: {
          rankId: promotion.targetRank.id,
          ...(rankPercent(promotion.targetRank) === 38 ? { rank38AchievedAt: promotedAt } : {}),
        },
      });
      await client.rankHistory.create({
        data: {
          regno,
          oldRankId: member.rankId,
          newRankId: promotion.targetRank.id,
          oldRankName: member.rank?.rankName,
          newRankName: promotion.targetRank.rankName,
          oldPercent: member.rank?.percentage ?? 0,
          newPercent: promotion.targetRank.percentage ?? 0,
          promotionReason: promotion.route || promotion.reason,
          qualificationSnapshot: JSON.stringify({
            promotionMethod: promotion.reason,
            qualificationRoute: promotion.route,
            ...promotion.snapshot,
          }),
          changedById: adminId ? Number(adminId) : undefined,
          createdAt: promotedAt,
        },
      });
      if (rankPercent(promotion.targetRank) >= 24) {
        await grantRankLicenses({ ...member, rank: promotion.targetRank }, promotion.targetRank, client);
      }
      if (rankPercent(promotion.targetRank) === 38) {
        await initializeRank38Facilities({ ...member, rank38AchievedAt: promotedAt }, promotedAt, client);
      }
      continue;
    }
  }
};

const gpgEligibilityForChain = async (chain, calculationDate, client, rankLabel = GPG_RANK_LABEL) => {
  const specialRegnos = chain
    .filter((sponsor) => rankPercent(sponsor.member.rank) === rankLabel)
    .map((sponsor) => sponsor.member.regno);
  if (!specialRegnos.length) return new Map();

  const subscriptions = await client.gpgSubscription.findMany({
    where: { regno: { in: specialRegnos }, cycleKey: cycleKey(calculationDate) },
  });
  const byRegno = new Map(subscriptions.map((subscription) => [subscription.regno, subscription]));

  return new Map(specialRegnos.map((regno) => {
    const subscription = byRegno.get(regno);
    return [regno, {
      subscribed: Boolean(subscription),
      approved: subscription?.approvalStatus === "Approved" && Boolean(subscription?.accessNumber),
      subscription: subscription || null,
    }];
  }));
};

const commissionSourceKey = ({ order, earner, type, level, percentage, gpgSlot }) =>
  `${order.orderId}:${earner.regno}:${type}:${level}:${money(percentage)}:${gpgSlot || 0}`;
export const processOrderBusiness = async ({ order, buyer, baseAmount, bv, recordBusiness = true }, client = prisma) => {
  const chainDepth = 20;
  const chain = await sponsorChain(buyer, chainDepth, client);
  const affectedRegnos = [buyer.regno, ...chain.map((sponsor) => sponsor.member.regno)];

  await updateRanksForMembers(affectedRegnos, undefined, client);

  const refreshedBuyer = await client.member.findUnique({ where: { regno: buyer.regno }, include: { rank: true } });
  const refreshedChain = await sponsorChain(refreshedBuyer || buyer, chainDepth, client);
  const sourceRegno = refreshedBuyer?.regno || buyer.regno;
  const calculationDate = order.saleDate ? new Date(order.saleDate) : new Date();
  const creditedKeys = new Set();
  const directPlan = await commissionPlan(client);

  await client.commission.deleteMany({ where: { orderId: order.id } });
  await client.walletLedger.deleteMany({
    where: {
      referenceId: order.orderId,
      type: "Credit",
      OR: [
        { description: { startsWith: "Direct Differential from" } },
        { description: { startsWith: "Rank Differential from" } },
        { description: { startsWith: "GPG Differential from" } },
        { description: { startsWith: "Rank 41 Special Differential from" } },
        { description: { startsWith: "DIRECT_RANK_INCOME from" } },
        { description: { startsWith: "RANK_38_GPG_DIFFERENTIAL from" } },
        { description: { startsWith: "RANK_41_GPG_DIFFERENTIAL from" } },
      ],
    },
  });

  const creditCommission = async ({ earner, sourceRegno, level, type, percentage, reasonCode, rankLabel, lowerRankLabel, gpgSlot, subscription }) => {
    const amountBeforeCap = (money(baseAmount) * money(percentage)) / 100;
    let amount = amountBeforeCap;
    const key = commissionSourceKey({ order, earner, type, level, percentage, gpgSlot });
    if (creditedKeys.has(key)) return;
    creditedKeys.add(key);

    let capApplied = false;
    if (["Direct Differential", "Rank Differential", "DIRECT_RANK_INCOME"].includes(type)) {
      const remainingCap = await remainingMonthlyCap(earner, earner.rank, calculationDate, client);
      if (remainingCap !== null && amount > remainingCap) {
        amount = Math.min(amount, remainingCap);
        capApplied = true;
      }
    }

    await client.commission.create({
      data: {
        orderId: order.id,
        earnerRegno: earner.regno,
        sourceRegno,
        level,
        type,
        baseAmount,
        percentage,
        amount,
        status: amount > 0 ? "Credited" : "Zero",
        sourceKey: key,
        reasonCode,
        rankLabel,
        lowerRankLabel,
        amountBeforeCap,
        capApplied,
        gpgSlot,
        auditJson: JSON.stringify({
          incomeConcept: type.includes("GPG") ? type : "DIRECT_RANK_INCOME",
          subscriptionId: subscription?.id || null,
          subscriptionCycle: subscription?.cycleKey || null,
          subscribedAt: subscription?.subscribedAt || null,
          approvalStatus: subscription?.approvalStatus || null,
        }),
      },
    });
    if (amount > 0) {
      await client.walletLedger.create({
        data: {
          regno: earner.regno,
          type: "Credit",
          description: `${type} from ${sourceRegno}${gpgSlot ? ` GPG slot ${gpgSlot}` : ""}`,
          amount,
          referenceId: order.orderId,
        },
      });
    }
  };

  for (const entry of calculateDirectRankEntries(refreshedChain, directPlan)) {
    await creditCommission({
      earner: entry.member,
      sourceRegno,
      level: entry.level,
      type: "DIRECT_RANK_INCOME",
      percentage: entry.percentage,
      reasonCode: entry.reasonCode,
      rankLabel: entry.rankLabel,
      lowerRankLabel: entry.lowerRankLabel,
    });
  }

  const gpgEligibility = await gpgEligibilityForChain(refreshedChain, calculationDate, client);
  for (const entry of calculateGpgEntries(refreshedChain, gpgEligibility)) {
    await creditCommission({
      earner: entry.member,
      sourceRegno,
      level: entry.level,
      type: "RANK_38_GPG_DIFFERENTIAL",
      percentage: entry.percentage,
      reasonCode: entry.reasonCode,
      rankLabel: GPG_RANK_LABEL,
      lowerRankLabel: GPG_RANK_LABEL,
      gpgSlot: entry.gpgSlot,
      subscription: entry.subscription,
    });
  }

  const rank41Eligibility = await gpgEligibilityForChain(refreshedChain, calculationDate, client, RANK_41_LABEL);
  for (const entry of calculateGpgEntries(refreshedChain, rank41Eligibility, RANK_41_GPG_SEQUENCE, RANK_41_LABEL)) {
    await creditCommission({
      earner: entry.member,
      sourceRegno,
      level: entry.level,
      type: "RANK_41_GPG_DIFFERENTIAL",
      percentage: entry.percentage,
      reasonCode: entry.reasonCode,
      rankLabel: RANK_41_LABEL,
      lowerRankLabel: RANK_41_LABEL,
      gpgSlot: entry.gpgSlot,
      subscription: entry.subscription,
    });
  }

  if (recordBusiness) {
    for (const sponsor of refreshedChain) {
      await client.downlineBusiness.create({
        data: {
          regno: sponsor.member.regno,
          downlineRegno: sourceRegno,
          businessAmount: bv,
          fromDate: new Date(),
          toDate: new Date(),
        },
      });
    }
  }
};
export const processActivationBusiness = async ({ pin, usedFor, usedBy }, client = prisma) => {
  const value = money(pin.pinValue);
  const name = [usedFor.firstName, usedFor.lastName].filter(Boolean).join(" ");
  const order = await client.order.create({
    data: {
      orderId: activationOrderId(),
      regno: usedFor.regno,
      name,
      pv: value / 100,
      bv: value,
      totalAmount: value,
      saleDate: new Date(),
      approvedStatus: 1,
      paymentMode: "Pin",
      totalGst: 0,
      totalWithGst: value,
      shippingCost: 0,
      subTotalAmount: value,
      billPath: `pin:${pin.pinNo}`,
      items: {
        create: [{
          slNo: 1,
          productDescription: "Activation License",
          price: value,
          offerPrice: value,
          discountPercent: 0,
          quantity: 1,
          grossAmount: value,
          gst: 0,
        }],
      },
    },
  });

  await client.onlineTransaction.create({
    data: {
      regno: usedFor.regno,
      name,
      mobile: usedFor.mobileNo,
      amountTxnId: activationTxnId(pin.pinNo),
      orderId: order.orderId,
      transactionAmount: value,
      txnDate: new Date(),
    },
  });

  await processOrderBusiness({ order, buyer: usedFor, baseAmount: value, bv: value }, client);

  if (usedBy.regno !== usedFor.regno) {
    await client.walletLedger.create({
      data: {
        regno: usedBy.regno,
        type: "Debit",
        description: `Pin used for ${usedFor.regno}`,
        amount: -value,
        referenceId: pin.pinNo,
      },
    });
  }

  return order;
};

export const commissions = async (query = {}, scopeRegno, client = prisma) => {
  const where = {
    ...(scopeRegno ? { earnerRegno: scopeRegno } : {}),
    ...(query.q ? {
      OR: [
        { earnerRegno: { contains: query.q } },
        { sourceRegno: { contains: query.q } },
        { type: { contains: query.q } },
        { earner: { is: { firstName: { contains: query.q } } } },
        { earner: { is: { lastName: { contains: query.q } } } },
        { source: { is: { firstName: { contains: query.q } } } },
        { source: { is: { lastName: { contains: query.q } } } },
      ],
    } : {}),
    ...(query.regno ? { earnerRegno: { contains: query.regno } } : {}),
    ...(query.sourceRegno ? { sourceRegno: { contains: query.sourceRegno } } : {}),
    ...dateRange("createdAt", query.fromDate, query.toDate),
  };
  return client.commission.findMany({
    where,
    include: { order: true, source: true, earner: true },
    orderBy: { createdAt: "desc" },
  });
};
