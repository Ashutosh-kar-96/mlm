import assert from "node:assert/strict";
import {
  assertNewcomerOrderLimit,
  calculateDirectRankEntries,
  calculateGpgEntries,
  cycleKey,
  updateRanksForMembers,
} from "../src/services/mlm.service.js";
import { autoAssignGpg, updateGpgApproval } from "../src/services/rank.service.js";
import prisma from "../src/config/db.js";

const rank = (percentage) => ({ percentage, baseRate: percentage === 14 ? 4 : percentage === 19 ? 9 : percentage });
const chain = (labels) =>
  labels.map((label, index) => ({
    level: index + 1,
    member: {
      regno: `T${index + 1}_${String(label).replace(".", "_")}`,
      rank: rank(label),
    },
  }));

const directPercents = (labels) => calculateDirectRankEntries(chain(labels)).map((entry) => entry.percentage);
const directReasons = (labels) => calculateDirectRankEntries(chain(labels)).map((entry) => entry.reasonCode);

assert.deepEqual(directPercents([14]), [4]);
assert.deepEqual(directPercents([14, 19]), [4, 5]);
assert.deepEqual(directPercents([14, 19, 24, 29, 38]), [4, 5, 5, 5, 9]);
assert.deepEqual(directPercents([41]), [41]);
assert.deepEqual(directPercents([38, 41]), [38, 3]);
assert.deepEqual(directPercents([14, 24, 38]), [4, 10, 14]);
assert.deepEqual(directPercents([29, 19, 24, 29, 38]), [29, 0, 0, 0, 9]);
assert.deepEqual(calculateDirectRankEntries(chain([10]), [
  { rankLabel: 10, baseRate: 10, monthlyCap: null },
  { rankLabel: 14, baseRate: 4, monthlyCap: 4500 },
]).map((entry) => entry.percentage), [10]);
assert.deepEqual(directReasons([29, 19, 24, 29, 38]), [
  "DIRECT_BASE_RATE",
  "LOWER_THAN_HIGHEST_RANK",
  "LOWER_THAN_HIGHEST_RANK",
  "SAME_AS_HIGHEST_RANK",
  "DIRECT_RANK_DIFFERENCE",
]);
assert.deepEqual(directPercents([24, 19, 29, 14, 38]), [24, 0, 5, 0, 9]);

const approved = (value, slot = 1, percentage = 7) => ({
  subscribed: value !== "none",
  approved: value === "approved",
  subscription: value === "approved" ? { accessNumber: slot, accessPercentage: percentage } : null,
});
const gpgChain = chain([29, 38, 38, 38, 38, 38, 38]);
const allApproved = new Map(gpgChain.map((entry, index) => [entry.member.regno, approved("approved", Math.max(1, index - 1), [7, 4.5, 3, 2, 1][Math.max(0, index - 2)] || 0)]));
assert.deepEqual(calculateGpgEntries(gpgChain, allApproved).map((entry) => entry.percentage), [7, 4.5, 3, 2, 1]);
assert.deepEqual(calculateGpgEntries(gpgChain, allApproved).map((entry) => entry.gpgSlot), [1, 2, 3, 4, 5]);

const mixedGpgChain = chain([29, 38, 38, 38, 38, 38]);
const mixedEligibility = new Map([
  [mixedGpgChain[2].member.regno, approved("approved", 1, 7)],
  [mixedGpgChain[3].member.regno, approved("none")],
  [mixedGpgChain[4].member.regno, approved("approved", 2, 4.5)],
  [mixedGpgChain[5].member.regno, approved("approved", 3, 3)],
]);
assert.deepEqual(calculateGpgEntries(mixedGpgChain, mixedEligibility).map((entry) => entry.percentage), [7, 0, 4.5, 3]);
assert.deepEqual(calculateGpgEntries(mixedGpgChain, mixedEligibility).map((entry) => entry.reasonCode), [
  "GPG_APPROVED",
  "GPG_NOT_SUBSCRIBED",
  "GPG_APPROVED",
  "GPG_APPROVED",
]);

const notApproved = new Map([[mixedGpgChain[2].member.regno, approved("pending")]]);
assert.deepEqual(calculateGpgEntries(mixedGpgChain.slice(0, 3), notApproved).map((entry) => entry.reasonCode), ["GPG_NOT_APPROVED"]);

const rollback = new Error("rollback mlm rules smoke data");
const rankIds = async (tx) => {
  const ranks = await Promise.all([0, 14, 19, 24, 29, 38, 41].map((percentage) =>
    tx.rank.upsert({
      where: { id: percentage === 0 ? 9080 : 9000 + percentage },
      update: { rankName: percentage === 0 ? "Smoke Newcomer" : `Smoke Rank ${percentage}`, percentage, levelNo: percentage },
      create: { id: percentage === 0 ? 9080 : 9000 + percentage, rankName: percentage === 0 ? "Smoke Newcomer" : `Smoke Rank ${percentage}`, percentage, levelNo: percentage },
    })
  ));
  return new Map(ranks.map((item) => [Number(item.percentage), item.id]));
};

const createMember = (tx, ids, regno, percentage, sponsorId = null) =>
  tx.member.create({
    data: {
      regno,
      firstName: regno,
      sponsorId,
      rankId: ids.get(percentage),
      planAmount: 0,
      status: 1,
    },
  });

let promotionCase = 0;
const expectPromotion = async (tx, ids, { name, candidateRank, directRanks = [], nested, expectedRank }) => {
  promotionCase += 1;
  const root = `SMKP${promotionCase}`;
  await createMember(tx, ids, root, candidateRank);
  for (let index = 0; index < directRanks.length; index += 1) {
    await createMember(tx, ids, `${root}_D${index + 1}`, directRanks[index], root);
  }
  if (nested) {
    const middle = `${root}_MID`;
    await createMember(tx, ids, middle, nested.middleRank, root);
    for (let index = 0; index < nested.childRanks.length; index += 1) {
      await createMember(tx, ids, `${middle}_C${index + 1}`, nested.childRanks[index], middle);
    }
  }

  await updateRanksForMembers([root], undefined, tx);
  const promoted = await tx.member.findUnique({ where: { regno: root }, include: { rank: true } });
  assert.equal(Number(promoted.rank.percentage), expectedRank, name);
};

const expectShoppingPromotion = async (tx, ids, amount, expectedRank) => {
  const regno = `SMK_SHOP_${amount}`;
  await createMember(tx, ids, regno, 0);
  await tx.order.create({
    data: {
      orderId: `SMKORD${amount}`,
      regno,
      name: regno,
      totalAmount: amount,
      pv: amount / 100,
      bv: amount,
      saleDate: new Date(),
      approvedStatus: 1,
    },
  });

  await updateRanksForMembers([regno], undefined, tx);
  const promoted = await tx.member.findUnique({ where: { regno }, include: { rank: true } });
  assert.equal(Number(promoted.rank.percentage), expectedRank, `shopping ${amount}`);
};

const seedGpgGroup = async (tx, ids, { prefix, rank, cycle, count = 7, times = [] }) => {
  const subscriptions = [];
  for (let index = 0; index < count; index += 1) {
    const regno = `${prefix}${index + 1}`;
    await createMember(tx, ids, regno, rank);
    subscriptions.push(await tx.gpgSubscription.create({
      data: {
        regno,
        rankLabel: rank,
        cycleKey: cycle,
        subscribedAt: times[index] || new Date(2026, 7, 20, 9, index, 0),
        approvalStatus: "Pending",
      },
    }));
  }
  return subscriptions;
};

const assignedPercentages = async (tx, cycle, rank) => {
  const rows = await tx.gpgSubscription.findMany({
    where: { cycleKey: cycle, rankLabel: rank },
    orderBy: { subscribedAt: "asc" },
  });
  return rows.map((item) => Number(item.accessPercentage || 0));
};

try {
  await prisma.$transaction(async (tx) => {
    const ids = await rankIds(tx);

    await expectPromotion(tx, ids, { name: "R14_TO_R24", candidateRank: 14, directRanks: [14, 14, 14, 14], expectedRank: 24 });
    await expectPromotion(tx, ids, { name: "R19_TO_R29", candidateRank: 19, directRanks: [19, 19, 19, 19], expectedRank: 29 });
    await expectPromotion(tx, ids, { name: "R24_TO_R38_A", candidateRank: 24, directRanks: [24, 24, 24, 24], expectedRank: 38 });
    await expectPromotion(tx, ids, { name: "R19_TO_R38_B", candidateRank: 19, directRanks: [24, 24, 24, 24], expectedRank: 38 });
    await expectPromotion(tx, ids, { name: "R19_TO_R38_C", candidateRank: 19, directRanks: [29, 29, 29, 29], expectedRank: 38 });
    await expectPromotion(tx, ids, { name: "R29_TO_R38_D", candidateRank: 29, directRanks: [24, 29, 19], expectedRank: 38 });
    await expectPromotion(tx, ids, { name: "R29_TO_R38_E", candidateRank: 29, nested: { middleRank: 19, childRanks: [29, 29, 29] }, expectedRank: 38 });
    await expectPromotion(tx, ids, { name: "R29_ROUTE_E_NEGATIVE", candidateRank: 29, directRanks: [19, 29, 29, 29], expectedRank: 29 });

    await expectShoppingPromotion(tx, ids, 4499, 0);
    await expectShoppingPromotion(tx, ids, 4500, 14);
    await expectShoppingPromotion(tx, ids, 9000, 19);
    await expectShoppingPromotion(tx, ids, 22500, 24);
    await expectShoppingPromotion(tx, ids, 38000, 29);

    assert.doesNotThrow(() => assertNewcomerOrderLimit({ rank: { percentage: 10 } }, 10000));
    assert.throws(() => assertNewcomerOrderLimit({ rank: { percentage: 10 } }, 10001), /Newcomer single order/);
    assert.doesNotThrow(() => assertNewcomerOrderLimit({ rank: { percentage: 14 } }, 50000));

    assert.equal(cycleKey(new Date(2026, 7, 19)), "2026-07-20");
    assert.equal(cycleKey(new Date(2026, 7, 20)), "2026-08-20");

    await seedGpgGroup(tx, ids, { prefix: "G38A", rank: 38, cycle: "2099-08-20" });
    const auto38 = await autoAssignGpg({ rank: 38, cycleKey: "2099-08-20" }, undefined, tx);
    assert.equal(auto38.assigned.length, 5);
    assert.deepEqual(await assignedPercentages(tx, "2099-08-20", 38), [7, 4.5, 3, 2, 1, 0, 0]);

    await seedGpgGroup(tx, ids, { prefix: "G41A", rank: 41, cycle: "2099-08-20" });
    const auto41 = await autoAssignGpg({ rank: 41, cycleKey: "2099-08-20" }, undefined, tx);
    assert.equal(auto41.assigned.length, 5);
    assert.deepEqual(await assignedPercentages(tx, "2099-08-20", 41), [8.25, 6.25, 4.5, 2.5, 1, 0, 0]);

    await seedGpgGroup(tx, ids, {
      prefix: "G38T",
      rank: 38,
      cycle: "2099-09-20",
      count: 2,
      times: [new Date(2026, 8, 20, 9, 10, 0), new Date(2026, 8, 20, 9, 5, 0)],
    });
    await autoAssignGpg({ rank: 38, cycleKey: "2099-09-20" }, undefined, tx);
    const timestampRows = await tx.gpgSubscription.findMany({ where: { cycleKey: "2099-09-20", rankLabel: 38 }, orderBy: { subscribedAt: "asc" } });
    assert.equal(timestampRows[0].regno, "G38T2");
    assert.equal(Number(timestampRows[0].accessPercentage), 7);

    const manual = await seedGpgGroup(tx, ids, { prefix: "G38M", rank: 38, cycle: "2099-10-20", count: 6 });
    for (const item of [manual[0], manual[2], manual[3], manual[4], manual[5]]) {
      await updateGpgApproval(item.id, { status: "Approved" }, undefined, tx);
    }
    await assert.rejects(() => updateGpgApproval(manual[1].id, { status: "Approved" }, undefined, tx), /five paying GPG positions/);
    const manualRows = await tx.gpgSubscription.findMany({ where: { cycleKey: "2099-10-20", rankLabel: 38 }, orderBy: { subscribedAt: "asc" } });
    assert.deepEqual(manualRows.map((item) => Number(item.accessPercentage || 0)), [7, 0, 4.5, 3, 2, 1]);
    assert.deepEqual(manualRows.filter((item) => item.accessNumber).map((item) => item.assignmentMode), ["MANUAL", "MANUAL", "MANUAL", "MANUAL", "MANUAL"]);

    await createMember(tx, ids, "G38N1", 38);
    await tx.gpgSubscription.create({ data: { regno: "G38N1", rankLabel: 38, cycleKey: "2026-11-20", subscribedAt: new Date(2026, 10, 20, 9, 0, 0), approvalStatus: "Approved", accessNumber: 1, accessPercentage: 7, assignmentMode: "AUTO", assignedAt: new Date() } });
    const nextCycle = await tx.gpgSubscription.findMany({ where: { regno: "G38N1", cycleKey: "2026-12-20" } });
    assert.equal(nextCycle.length, 0);

    throw rollback;
  }, { maxWait: 30000, timeout: 120000 });
} catch (error) {
  if (error !== rollback) throw error;
}

console.log("ok MLM direct, GPG, promotion structure, shopping and order-limit rules");
await prisma.$disconnect();
