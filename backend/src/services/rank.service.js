import prisma from "../config/db.js";
import { dateRange, pagination } from "../utils/query.js";
import { logAudit } from "./audit.service.js";

const money = (value) => Number(value || 0);
const parseSetting = async (keyName, fallback) => {
  const setting = await prisma.mlmSetting.findUnique({ where: { keyName } });
  if (!setting) return fallback;
  try {
    const parsed = JSON.parse(setting.valueJson);
    return parsed || fallback;
  } catch {
    return fallback;
  }
};

const groupFallback = [
  { rankPercent: 38, generations: [7, 4.5, 3, 2, 1] },
  { rankPercent: 41, generations: [11.25, 6.25, 4.5, 2.5, 1] },
];

const rewardFallback = [
  { rankPercent: 38, title: "Personal BV Case Reward", condition: "Personal BV milestone", reward: "Rs 5,000 case reward" },
  { rankPercent: 38, title: "All Team Business Slab", condition: "38% all team business slab", reward: "Domestic tour" },
  { rankPercent: 41, title: "Personal BV 10 Lakh", condition: "10 lakh personal BV", reward: "Rs 15,000 case reward" },
  { rankPercent: 42, title: "6 Month Rank Achievement", condition: "Achieve 42% rank within 6 months", reward: "Latest iPhone or Rs 2 lakh case reward" },
  { rankPercent: 42, title: "18 Month Rank Achievement", condition: "Achieve 42% rank within 18 months", reward: "Rs 8 lakh car bonus and international family tour, 2 countries" },
];

const rewardKey = (reward) =>
  String(reward.key || `${reward.rankPercent}-${reward.title}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const mapRewardClaim = (claim) => claim && ({
  id: Number(claim.id),
  regno: claim.regno,
  rewardKey: claim.reward_key,
  title: claim.title,
  conditionText: claim.condition_text,
  rewardText: claim.reward_text,
  rankPercent: claim.rank_percent,
  selfBv: claim.self_bv,
  teamBv: claim.team_bv,
  status: claim.status,
  remarks: claim.remarks,
  approvedAt: claim.approved_at,
  paidAt: claim.paid_at,
  rejectedAt: claim.rejected_at,
  createdAt: claim.created_at,
  updatedAt: claim.updated_at,
});

const upsertRewardClaim = async ({ member, reward, selfBv, teamBv }) => {
  const key = rewardKey(reward);
  await prisma.$executeRaw`
    INSERT INTO tbl_reward_claims
      (regno, reward_key, title, condition_text, reward_text, rank_percent, self_bv, team_bv, updated_at)
    VALUES
      (${member.regno}, ${key}, ${reward.title}, ${reward.condition || null}, ${reward.reward}, ${money(reward.rankPercent)}, ${selfBv}, ${teamBv}, NOW(3))
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      condition_text = VALUES(condition_text),
      reward_text = VALUES(reward_text),
      rank_percent = VALUES(rank_percent),
      self_bv = VALUES(self_bv),
      team_bv = VALUES(team_bv),
      updated_at = NOW(3)
  `;
};

const findRewardClaimsByRegno = async (regno) => {
  const claims = await prisma.$queryRaw`
    SELECT * FROM tbl_reward_claims
    WHERE regno = ${regno}
    ORDER BY created_at DESC
  `;
  return claims.map(mapRewardClaim);
};

export const history = async (query = {}) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.regno ? { regno: { contains: query.regno } } : {}),
    ...dateRange("createdAt", query.fromDate, query.toDate),
  };
  const [items, total] = await Promise.all([
    prisma.rankHistory.findMany({ where, skip, take, include: { member: true }, orderBy: { createdAt: "desc" } }),
    prisma.rankHistory.count({ where }),
  ]);
  return { items, meta: { page, limit, total } };
};

export const upgrade = async ({ regno, rankId, rankName, oldPercent, newPercent }, adminId) => {
  const member = await prisma.member.findUnique({ where: { regno }, include: { rank: true } });
  const rank = rankId
    ? await prisma.rank.findUnique({ where: { id: Number(rankId) } })
    : await prisma.rank.findFirst({ where: { rankName: rankName || "" } });
  if (!member || !rank) {
    const error = new Error("Member or rank not found");
    error.status = 404;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    await tx.member.update({ where: { regno }, data: { rankId: rank.id } });
    const history = await tx.rankHistory.create({
      data: {
        regno,
        oldRankId: member.rankId,
        newRankId: rank.id,
        oldRankName: member.rank?.rankName,
        newRankName: rank.rankName,
        oldPercent: oldPercent === undefined ? undefined : Number(oldPercent),
        newPercent: newPercent === undefined ? undefined : Number(newPercent),
        changedById: adminId ? Number(adminId) : undefined,
      },
    });
    await logAudit(adminId, "rank.upgrade", "Member", regno, {
      oldRank: member.rank?.rankName,
      newRank: rank.rankName,
    }, tx);
    return history;
  });
};

export const planSummary = async () => {
  const [ranks, groupIncentives, rewards, legRules] = await Promise.all([
    prisma.rank.findMany({ where: { percentage: { not: null } }, orderBy: [{ levelNo: "asc" }, { id: "asc" }] }),
    parseSetting("group_incentive_plan", groupFallback),
    parseSetting("reward_plan", rewardFallback),
    parseSetting("rank_leg_rules", []),
  ]);

  return {
    ranks,
    differentialIncome: {
      type: "Rank Differential",
      description: "Sponsor/upline earns only the positive percentage difference between their unlocked rank and the already paid downline percentage.",
    },
    groupIncentives,
    legRules,
    rewards,
  };
};

export const rewards = async (query = {}) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.regno ? { regno: { contains: query.regno } } : {}),
    ...(query.q ? {
      OR: [
        { regno: { contains: query.q } },
        { firstName: { contains: query.q } },
        { lastName: { contains: query.q } },
      ],
    } : {}),
  };
  const [members, total, rewardPlan] = await Promise.all([
    prisma.member.findMany({ where, skip, take, include: { rank: true }, orderBy: { createdAt: "desc" } }),
    prisma.member.count({ where }),
    parseSetting("reward_plan", rewardFallback),
  ]);

  const items = await Promise.all(members.map(async (member) => {
    const [selfBusiness, teamBusiness] = await Promise.all([
      prisma.order.aggregate({ where: { regno: member.regno, approvedStatus: 1 }, _sum: { bv: true } }),
      prisma.downlineBusiness.aggregate({ where: { regno: member.regno }, _sum: { businessAmount: true } }),
    ]);
    const rankPercent = money(member.rank?.percentage);
    const selfBv = money(selfBusiness._sum.bv);
    const teamBv = money(teamBusiness._sum.businessAmount);
    const eligibleRewards = rewardPlan.filter((reward) => rankPercent >= money(reward.rankPercent));
    for (const reward of eligibleRewards) {
      await upsertRewardClaim({ member, reward, selfBv, teamBv });
    }
    const claims = await findRewardClaimsByRegno(member.regno);
    const claimsByKey = new Map(claims.map((claim) => [claim.rewardKey, claim]));
    return {
      regno: member.regno,
      name: [member.firstName, member.lastName].filter(Boolean).join(" "),
      rankName: member.rank?.rankName || "Member",
      rankPercent,
      selfBv,
      teamBv,
      rewards: rewardPlan.map((reward) => ({
        ...reward,
        key: rewardKey(reward),
        eligible: rankPercent >= money(reward.rankPercent),
        claim: claimsByKey.get(rewardKey(reward)) || null,
      })),
    };
  }));

  return { items, meta: { page, limit, total } };
};

export const updateRewardClaim = async (id, data = {}, adminId) => {
  const claims = await prisma.$queryRaw`SELECT * FROM tbl_reward_claims WHERE id = ${Number(id)} LIMIT 1`;
  const claim = mapRewardClaim(claims[0]);
  if (!claim) {
    const error = new Error("Reward claim not found");
    error.status = 404;
    throw error;
  }
  const status = String(data.status || "").trim();
  if (!["Pending", "Approved", "Paid", "Rejected"].includes(status)) {
    const error = new Error("Reward status must be Pending, Approved, Paid, or Rejected");
    error.status = 400;
    throw error;
  }
  const now = new Date();
  await prisma.$executeRaw`
    UPDATE tbl_reward_claims
    SET
      status = ${status},
      remarks = ${data.remarks || null},
      approved_at = ${status === "Approved" ? now : status === "Paid" ? (claim.approvedAt || now) : status === "Pending" ? null : claim.approvedAt},
      paid_at = ${status === "Paid" ? now : status === "Pending" ? null : claim.paidAt},
      rejected_at = ${status === "Rejected" ? now : status === "Pending" || status === "Approved" || status === "Paid" ? null : claim.rejectedAt},
      updated_at = NOW(3)
    WHERE id = ${Number(id)}
  `;
  const updatedRows = await prisma.$queryRaw`SELECT * FROM tbl_reward_claims WHERE id = ${Number(id)} LIMIT 1`;
  const updated = mapRewardClaim(updatedRows[0]);
  await logAudit(adminId, "reward.status", "RewardClaim", String(id), {
    regno: claim.regno,
    oldStatus: claim.status,
    newStatus: status,
  });
  return updated;
};
