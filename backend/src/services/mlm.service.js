import prisma from "../config/db.js";
import { dateRange } from "../utils/query.js";

const DEFAULT_COMMISSION_PLAN = [
  { level: 1, type: "Direct Bonus", percentage: 10 },
];

const DEFAULT_GROUP_INCENTIVE_PLAN = [
  { rankPercent: 38, generations: [7, 4.5, 3, 2, 1] },
  { rankPercent: 41, generations: [11.25, 6.25, 4.5, 2.5, 1] },
];

const DEFAULT_RANK_LEG_RULES = [
  { targetPercent: 24, any: [{ minLegs: [{ percent: 14, count: 4 }] }] },
  { targetPercent: 29, any: [{ minLegs: [{ percent: 19, count: 4 }] }] },
  {
    targetPercent: 38,
    any: [
      { minLegs: [{ percent: 24, count: 4 }] },
      { minLegs: [{ percent: 29, count: 3 }, { percent: 19, count: 1 }] },
    ],
  },
  { targetPercent: 41, any: [{ minLegs: [{ percent: 38, count: 4 }] }] },
];

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

const satisfiesLegCondition = (legPercents, requirements = []) => {
  const available = [...legPercents].sort((a, b) => b - a);
  const orderedRequirements = [...requirements].sort((a, b) => money(b.percent) - money(a.percent));

  for (const requirement of orderedRequirements) {
    let matched = 0;
    for (let index = 0; index < available.length && matched < money(requirement.count); index += 1) {
      if (available[index] >= money(requirement.percent)) {
        available.splice(index, 1);
        index -= 1;
        matched += 1;
      }
    }
    if (matched < money(requirement.count)) return false;
  }

  return true;
};

const satisfiesRankRule = (rank, legPercents, rulesByPercent) => {
  const rule = rulesByPercent.get(rankPercent(rank));
  if (!rule) return true;
  return (rule.any || []).some((condition) => satisfiesLegCondition(legPercents, condition.minLegs));
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

export const updateRanksForMembers = async (regnos, adminId, client = prisma) => {
  const uniqueRegnos = [...new Set(regnos.filter(Boolean))];
  const [ranks, legRules] = await Promise.all([
    client.rank.findMany({
      where: { percentage: { not: null } },
      orderBy: [{ levelNo: "asc" }, { criteriaBv: "asc" }],
    }),
    rankLegRules(client),
  ]);
  const rulesByPercent = new Map(legRules.map((rule) => [money(rule.targetPercent), rule]));

  for (const regno of uniqueRegnos) {
    const member = await client.member.findUnique({ where: { regno }, include: { rank: true } });
    if (!member) continue;

    const [business, selfBusiness, directMembers] = await Promise.all([
      client.downlineBusiness.aggregate({
      where: { regno },
      _sum: { businessAmount: true },
      }),
      client.order.aggregate({
      where: { regno, approvedStatus: 1 },
      _sum: { bv: true },
      }),
      client.member.findMany({
        where: { sponsorId: regno, status: { not: 2 } },
        include: { rank: true },
      }),
    ]);
    const totalBv = money(business._sum.businessAmount) + money(selfBusiness._sum.bv);
    const legPercents = directMembers.map((item) => rankPercent(item.rank));
    const currentPercent = rankPercent(member.rank);

    let eligibleRank = [...ranks]
      .reverse()
      .find((rank) => {
        if (money(rank.challengeBusinessBv) > 0) return false;
        const targetPercent = rankPercent(rank);
        const hasSelfShopping = totalBv >= money(rank.selfShoppingAmount ?? rank.criteriaBv);
        const isProgression = targetPercent > currentPercent;
        return isProgression && hasSelfShopping && satisfiesRankRule(rank, legPercents, rulesByPercent);
      });

    const challengeRank = [...ranks].reverse().find((rank) => money(rank.challengeBusinessBv) > 0);
    if (challengeRank && currentPercent >= 41 && rankPercent(challengeRank) > currentPercent) {
      const seniorRank = ranks.find((rank) => rankPercent(rank) === 41);
      const reachedAt = seniorRank ? await latestRankReachedAt(regno, seniorRank, client) : undefined;
      const challengeBv = await challengeWindowBusiness(regno, reachedAt || member.paidDate || member.doj || member.createdAt, challengeRank.challengeMonths, client);
      if (challengeBv >= money(challengeRank.challengeBusinessBv)) {
        eligibleRank = challengeRank;
      }
    }

    if (eligibleRank && eligibleRank.id !== member.rankId) {
      await client.member.update({ where: { regno }, data: { rankId: eligibleRank.id } });
      await client.rankHistory.create({
        data: {
          regno,
          oldRankId: member.rankId,
          newRankId: eligibleRank.id,
          oldRankName: member.rank?.rankName,
          newRankName: eligibleRank.rankName,
          oldPercent: member.rank?.percentage ?? 0,
          newPercent: eligibleRank.percentage ?? 0,
          changedById: adminId ? Number(adminId) : undefined,
        },
      });
    }
  }
};

export const processOrderBusiness = async ({ order, buyer, baseAmount, bv, recordBusiness = true }, client = prisma) => {
  const [, groupPlan] = await Promise.all([commissionPlan(client), groupIncentivePlan(client)]);
  const maxGroupDepth = Math.max(0, ...groupPlan.flatMap((plan) => plan.generations?.map((_, index) => index + 1) || []));
  const chain = await sponsorChain(buyer, Math.max(maxGroupDepth, 20), client);
  const affectedRegnos = [buyer.regno];

  for (const sponsor of chain) affectedRegnos.push(sponsor.member.regno);
  await updateRanksForMembers(affectedRegnos, undefined, client);

  const refreshedBuyer = await client.member.findUnique({ where: { regno: buyer.regno }, include: { rank: true } });
  const refreshedChain = await sponsorChain(refreshedBuyer || buyer, Math.max(maxGroupDepth, 20), client);
  let paidPercent = rankPercent(refreshedBuyer?.rank) || 10;
  const creditedKeys = new Set();

  const creditCommission = async ({ earner, sourceRegno, level, type, percentage }) => {
    const amount = (money(baseAmount) * money(percentage)) / 100;
    if (amount <= 0) return;
    const key = `${earner.regno}:${type}:${level}:${percentage}`;
    if (creditedKeys.has(key)) return;
    creditedKeys.add(key);
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
      },
    });
    await client.walletLedger.create({
      data: {
        regno: earner.regno,
        type: "Credit",
        description: `${type} from ${sourceRegno}`,
        amount,
        referenceId: order.orderId,
      },
    });
  };

  for (const sponsor of refreshedChain) {
    const sponsorPercent = rankPercent(sponsor.member.rank);
    const percentage = sponsorPercent - paidPercent;
    if (percentage > 0) {
      await creditCommission({
        earner: sponsor.member,
        sourceRegno: buyer.regno,
        level: sponsor.level,
        type: sponsor.level === 1 ? "Direct Differential" : "Rank Differential",
        percentage,
      });
      paidPercent = sponsorPercent;
    }
  }

  for (const sponsor of refreshedChain.filter((item) => item.level <= maxGroupDepth)) {
    const sponsorPercent = rankPercent(sponsor.member.rank);
    const plan = [...groupPlan]
      .sort((a, b) => money(b.rankPercent) - money(a.rankPercent))
      .find((item) => sponsorPercent >= money(item.rankPercent));
    const percentage = money(plan?.generations?.[sponsor.level - 1]);
    if (percentage > 0) {
      await creditCommission({
        earner: sponsor.member,
        sourceRegno: buyer.regno,
        level: sponsor.level,
        type: `${money(plan.rankPercent)}% Group Incentive`,
        percentage,
      });
    }
  }

  if (recordBusiness) {
    for (const sponsor of refreshedChain) {
      await client.downlineBusiness.create({
        data: {
          regno: sponsor.member.regno,
          downlineRegno: buyer.regno,
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
