import prisma from "../config/db.js";
import { dateRange, pagination } from "../utils/query.js";
import { logAudit } from "./audit.service.js";
import { grantRankLicenses, initializeRank38Facilities } from "./mlm.service.js";
import { cycleKey as currentGpgCycleKey, cycleRange } from "./mlm.service.js";

const money = (value) => Number(value || 0);
const specialSequences = new Map([
  [38, [7, 4.5, 3, 2, 1]],
  [41, [8.25, 6.25, 4.5, 2.5, 1]],
]);

const rankPercentByName = new Map([
  ["Free Signup", 10],
  ["Free Sign Up", 10],
  ["Fashion Influencer", 14],
  ["Vision Influencer", 19],
  ["Promoter", 24],
  ["Sales Executive", 29],
  ["Junior Sales Executive", 38],
  ["Senior Sales Executive", 41],
  ["Zonal Sales Executive", 42],
]);

const normalizeRankName = (rankName) => {
  const trimmed = String(rankName || "").trim();
  return trimmed.replace(/\s+/g, " ");
};

const firstAvailableGpgSlot = async (tx, { cycleKey, rankLabel, excludeId }) => {
  const assigned = await tx.gpgSubscription.findMany({
    where: {
      cycleKey,
      rankLabel,
      accessNumber: { not: null },
      ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
    },
    select: { accessNumber: true },
  });
  const used = new Set(assigned.map((item) => Number(item.accessNumber)));
  return [1, 2, 3, 4, 5].find((slot) => !used.has(slot)) || null;
};
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

const groupFallback = [{ rankPercent: 38, generations: [7, 4.5, 3, 2, 1], enabled: false, base: "TBD" }];

const rewardFallback = [];

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
  const normalizedRegno = String(regno || "").trim().toUpperCase();
  const normalizedRankName = normalizeRankName(rankName);
  const requestedPercent = rankPercentByName.get(normalizedRankName);
  const member = await prisma.member.findUnique({ where: { regno: normalizedRegno }, include: { rank: true } });
  const rank = rankId
    ? await prisma.rank.findUnique({ where: { id: Number(rankId) } })
    : requestedPercent === undefined
      ? await prisma.rank.findFirst({ where: { rankName: normalizedRankName } })
      : await prisma.rank.findFirst({
        where: {
          OR: [
            { percentage: requestedPercent },
            { rankName: normalizedRankName },
          ],
        },
        orderBy: [{ levelNo: "asc" }, { id: "asc" }],
      });
  if (!member) {
    const error = new Error(`Member ${normalizedRegno || "ID"} not found`);
    error.status = 404;
    throw error;
  }
  if (!rank) {
    const error = new Error(`Rank ${normalizedRankName || "name"} not found`);
    error.status = 404;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    await tx.member.update({ where: { regno: normalizedRegno }, data: { rankId: rank.id } });
    await grantRankLicenses({ ...member, rank }, rank, tx);
    if (money(rank.percentage) === 38) {
      await initializeRank38Facilities(member, new Date(), tx);
    }
    const history = await tx.rankHistory.create({
      data: {
        regno: normalizedRegno,
        oldRankId: member.rankId,
        newRankId: rank.id,
        oldRankName: member.rank?.rankName,
        newRankName: rank.rankName,
        oldPercent: oldPercent === undefined ? undefined : Number(oldPercent),
        newPercent: newPercent === undefined ? undefined : Number(newPercent),
        promotionReason: "ADMIN_MANUAL",
        qualificationSnapshot: JSON.stringify({ source: "ADMIN_MANUAL", adminId: adminId || null }),
        changedById: adminId ? Number(adminId) : undefined,
      },
    });
    await logAudit(adminId, "rank.upgrade", "Member", normalizedRegno, {
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
      description: "Walk upline from buyer: first qualifying direct rank earns base rate, higher rank labels earn the positive label gap, and equal/lower rank labels receive auditable 0%. GPG eligibility is separate and applies only to extra Rank-38 income.",
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
    const earningPercent = money(member.rank?.baseRate ?? member.rank?.percentage);
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
      earningPercent,
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

export const subscribeGpg = async (regno, data = {}) => {
  const member = await prisma.member.findUnique({ where: { regno }, include: { rank: true } });
  const rankLabel = money(member?.rank?.percentage);
  if (!member || !specialSequences.has(rankLabel)) {
    const error = new Error("Only Rank 38 and Rank 41 members can subscribe for GPG");
    error.status = 400;
    throw error;
  }
  const cycleKey = data.cycleKey || currentGpgCycleKey();
  return prisma.gpgSubscription.upsert({
    where: { regno_cycleKey: { regno, cycleKey } },
    update: {},
    create: {
      regno,
      cycleKey,
      rankLabel,
      subscribedAt: new Date(),
      approvalStatus: "Pending",
      metadataJson: JSON.stringify({ source: "MEMBER_SUBSCRIPTION" }),
    },
  });
};

export const gpgSubscriptions = async (query = {}) => {
  const { skip, take, page, limit } = pagination(query);
  const cycle = query.cycleKey || currentGpgCycleKey();
  const range = cycleRange(cycle);
  const where = {
    ...(query.regno ? { regno: { contains: query.regno } } : {}),
    cycleKey: cycle,
    ...(query.status ? { approvalStatus: query.status } : {}),
    ...(query.rank ? { rankLabel: Number(query.rank) } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.gpgSubscription.findMany({ where, skip, take, include: { member: { include: { rank: true } } }, orderBy: { subscribedAt: "asc" } }),
    prisma.gpgSubscription.count({ where }),
  ]);
  return {
    items,
    cycle: {
      key: cycle,
      start: range.start,
      end: range.end,
    },
    meta: { page, limit, total },
  };
};

export const licenseUsages = async (query = {}) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.giverRegno ? { giverRegno: { contains: query.giverRegno } } : {}),
    ...(query.receiverRegno ? { receiverRegno: { contains: query.receiverRegno } } : {}),
    ...dateRange("createdAt", query.fromDate, query.toDate),
  };
  const [items, total] = await Promise.all([
    prisma.licenseUsage.findMany({
      where,
      skip,
      take,
      include: { giver: { include: { rank: true } }, receiver: { include: { rank: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.licenseUsage.count({ where }),
  ]);
  return { items, meta: { page, limit, total } };
};

export const rankChallenges = async (query = {}) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.regno ? { regno: { contains: query.regno } } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.challengeType ? { challengeType: query.challengeType } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.rankChallenge.findMany({
      where,
      skip,
      take,
      include: { member: { include: { rank: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rankChallenge.count({ where }),
  ]);
  return { items, meta: { page, limit, total } };
};

export const updateGpgApproval = async (id, data = {}, adminId, client = prisma) => {
  const status = String(data.status || "").trim();
  if (!["Approved", "Rejected", "Pending"].includes(status)) {
    const error = new Error("GPG status must be Approved, Rejected, or Pending");
    error.status = 400;
    throw error;
  }

  const run = async (tx) => {
    const subscription = await tx.gpgSubscription.findUnique({
      where: { id: Number(id) },
      include: { member: { include: { rank: true } } },
    });
    if (!subscription) {
      const error = new Error("GPG subscription not found");
      error.status = 404;
      throw error;
    }
    const rankLabel = money(subscription.rankLabel ?? subscription.member?.rank?.percentage);
    const sequence = specialSequences.get(rankLabel);
    if (status === "Approved" && !sequence) {
      const error = new Error("Only Rank 38 and Rank 41 subscriptions have confirmed special differential percentages");
      error.status = 400;
      throw error;
    }
    const nextAccessNumber = status === "Approved"
      ? subscription.accessNumber || await firstAvailableGpgSlot(tx, { cycleKey: subscription.cycleKey, rankLabel, excludeId: subscription.id })
      : null;
    if (status === "Approved" && !nextAccessNumber) {
      const error = new Error("Only five paying GPG positions are allowed for this rank and cycle");
      error.status = 400;
      throw error;
    }
    const now = new Date();
    const updated = await tx.gpgSubscription.update({
      where: { id: subscription.id },
      data: {
        approvalStatus: status,
        approvedAt: status === "Approved" ? now : null,
        rejectedAt: status === "Rejected" ? now : null,
        approvedById: status === "Approved" ? Number(adminId) || null : null,
        accessNumber: status === "Approved" ? nextAccessNumber : null,
        accessPercentage: status === "Approved" ? sequence[nextAccessNumber - 1] : null,
        rankLabel,
        assignmentMode: status === "Approved" ? "MANUAL" : null,
        assignedAt: status === "Approved" ? now : null,
        metadataJson: JSON.stringify({ remarks: data.remarks || null }),
      },
    });
    await logAudit(adminId, "gpg.approval", "GpgSubscription", String(id), {
      regno: subscription.regno,
      cycleKey: subscription.cycleKey,
      oldStatus: subscription.approvalStatus,
      newStatus: status,
    }, tx);
    return updated;
  };

  return typeof client.$transaction === "function" ? client.$transaction(run) : run(client);
};

export const autoAssignGpg = async ({ rank, cycleKey, replaceExisting = false }, adminId, client = prisma) => {
  const rankLabel = money(rank);
  const sequence = specialSequences.get(rankLabel);
  if (!sequence) {
    const error = new Error("Rank must be 38 or 41 for GPG auto assignment");
    error.status = 400;
    throw error;
  }
  const cycle = cycleKey || currentGpgCycleKey();

  const run = async (tx) => {
    const existingAssignments = await tx.gpgSubscription.count({
      where: {
        cycleKey: cycle,
        rankLabel,
        accessNumber: { not: null },
      },
    });
    if (existingAssignments > 0 && !replaceExisting) {
      const error = new Error("GPG assignments already exist for this rank and cycle. Auto assignment will not overwrite manual or previous assignments.");
      error.status = 400;
      throw error;
    }
    if (replaceExisting) {
      await tx.gpgSubscription.updateMany({
        where: {
          cycleKey: cycle,
          rankLabel,
        },
        data: {
          approvalStatus: "Pending",
          approvedAt: null,
          approvedById: null,
          rejectedAt: null,
          accessNumber: null,
          accessPercentage: null,
          assignmentMode: null,
          assignedAt: null,
        },
      });
    }

    const subscriptions = await tx.gpgSubscription.findMany({
      where: {
        cycleKey: cycle,
        rankLabel,
        approvalStatus: { not: "Rejected" },
      },
      include: { member: { include: { rank: true } } },
      orderBy: [{ subscribedAt: "asc" }, { id: "asc" }],
    });
    const selected = subscriptions.slice(0, sequence.length);
    const now = new Date();
    const updated = [];

    for (let index = 0; index < selected.length; index += 1) {
      const item = selected[index];
      updated.push(await tx.gpgSubscription.update({
        where: { id: item.id },
        data: {
          approvalStatus: "Approved",
          approvedAt: now,
          approvedById: Number(adminId) || null,
          rejectedAt: null,
          accessNumber: index + 1,
          accessPercentage: sequence[index],
          assignmentMode: "AUTO",
          assignedAt: now,
          rankLabel,
          metadataJson: JSON.stringify({ source: "AUTO_ASSIGN_FIRST_5" }),
        },
      }));
    }

    await tx.gpgSubscription.updateMany({
      where: {
        cycleKey: cycle,
        rankLabel,
        id: { notIn: selected.map((item) => item.id) },
        approvalStatus: { not: "Rejected" },
      },
      data: {
        approvalStatus: "Pending",
        approvedAt: null,
        approvedById: null,
        accessNumber: null,
        accessPercentage: null,
        assignmentMode: null,
        assignedAt: null,
      },
    });

    await logAudit(adminId, "gpg.autoAssign", "GpgSubscription", `${cycle}:${rankLabel}`, {
      cycleKey: cycle,
      rankLabel,
      assigned: updated.map((item) => ({
        regno: item.regno,
        accessNumber: item.accessNumber,
        accessPercentage: item.accessPercentage,
      })),
    }, tx);

    return {
      cycleKey: cycle,
      rankLabel,
      assigned: updated,
      skipped: Math.max(0, subscriptions.length - updated.length),
    };
  };

  return typeof client.$transaction === "function" ? client.$transaction(run) : run(client);
};
