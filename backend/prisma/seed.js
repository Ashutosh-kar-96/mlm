import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const date = (value) => new Date(value);

async function main() {
  const adminPassword = await bcrypt.hash("suraj@@@", 10);

  const admin = await prisma.admin.upsert({
    where: { id: 1 },
    update: {
      username: "Admin",
      password: adminPassword,
      updatedAt: new Date(),
    },
    create: {
      id: 1,
      username: "Admin",
      password: adminPassword,
    },
  });

  const ranks = [
    { id: 8, rankName: "Free Signup", criteriaBv: 0, levelNo: 0, percentage: 10, baseRate: 0, monthlyCap: null, selfShoppingAmount: 0 },
    { id: 1, rankName: "Fashion Influencer", criteriaBv: 4500, levelNo: 1, percentage: 14, baseRate: 4, monthlyCap: 4500, selfShoppingAmount: 4500 },
    { id: 2, rankName: "Vision Influencer", criteriaBv: 9000, levelNo: 2, percentage: 19, baseRate: 9, monthlyCap: 9000, selfShoppingAmount: 9000 },
    { id: 3, rankName: "Promoter", criteriaBv: 22500, levelNo: 3, percentage: 24, baseRate: 24, monthlyCap: null, selfShoppingAmount: 22500 },
    { id: 4, rankName: "Sales Executive", criteriaBv: 38000, levelNo: 4, percentage: 29, baseRate: 29, monthlyCap: null, selfShoppingAmount: 38000 },
    { id: 5, rankName: "Junior Sales Executive", criteriaBv: 0, levelNo: 5, percentage: 38, baseRate: 38, monthlyCap: null, selfShoppingAmount: 0 },
    { id: 6, rankName: "Senior Sales Executive", criteriaBv: 0, levelNo: 6, percentage: 41, baseRate: null, monthlyCap: null, selfShoppingAmount: 0 },
    { id: 7, rankName: "Zonal Sales Executive", criteriaBv: 0, levelNo: 7, percentage: 42, baseRate: null, monthlyCap: null, selfShoppingAmount: 0, challengeBusinessBv: null, challengeMonths: null },
  ];

  for (const rank of ranks) {
    await prisma.rank.upsert({
      where: { id: rank.id },
      update: rank,
      create: rank,
    });
  }

  await prisma.mlmSetting.upsert({
    where: { keyName: "rank_leg_rules" },
    update: {
      valueJson: JSON.stringify([
        { route: "STRUCTURE_14_4X14", candidateRank: 14, directRanks: [14, 14, 14, 14], targetRank: 24 },
        { route: "STRUCTURE_19_4X19", candidateRank: 19, directRanks: [19, 19, 19, 19], targetRank: 29 },
        { route: "STRUCTURE_24_4X24", candidateRank: 24, directRanks: [24, 24, 24, 24], targetRank: 38 },
        { route: "STRUCTURE_19_4X24", candidateRank: 19, directRanks: [24, 24, 24, 24], targetRank: 38 },
        { route: "STRUCTURE_19_4X29", candidateRank: 19, directRanks: [29, 29, 29, 29], targetRank: 38 },
        { route: "STRUCTURE_29_MIXED_24_29_19", candidateRank: 29, directRanks: [24, 29, 19], targetRank: 38 },
        { route: "STRUCTURE_29_VIA_19_3X29", candidateRank: 29, directRank: 19, childDirectRanks: [29, 29, 29], targetRank: 38 },
        { route: "STRUCTURE_38_4X38", candidateRank: 38, directRanks: [38, 38, 38, 38], targetRank: 41 },
      ]),
      description: "Confirmed exact structural promotion routes. Direct means directly sponsored unless route explicitly has childDirectRanks.",
    },
    create: {
      keyName: "rank_leg_rules",
      valueJson: JSON.stringify([
        { route: "STRUCTURE_14_4X14", candidateRank: 14, directRanks: [14, 14, 14, 14], targetRank: 24 },
        { route: "STRUCTURE_19_4X19", candidateRank: 19, directRanks: [19, 19, 19, 19], targetRank: 29 },
        { route: "STRUCTURE_24_4X24", candidateRank: 24, directRanks: [24, 24, 24, 24], targetRank: 38 },
        { route: "STRUCTURE_19_4X24", candidateRank: 19, directRanks: [24, 24, 24, 24], targetRank: 38 },
        { route: "STRUCTURE_19_4X29", candidateRank: 19, directRanks: [29, 29, 29, 29], targetRank: 38 },
        { route: "STRUCTURE_29_MIXED_24_29_19", candidateRank: 29, directRanks: [24, 29, 19], targetRank: 38 },
        { route: "STRUCTURE_29_VIA_19_3X29", candidateRank: 29, directRank: 19, childDirectRanks: [29, 29, 29], targetRank: 38 },
        { route: "STRUCTURE_38_4X38", candidateRank: 38, directRanks: [38, 38, 38, 38], targetRank: 41 },
      ]),
      description: "Confirmed exact structural promotion routes. Direct means directly sponsored unless route explicitly has childDirectRanks.",
    },
  });

  await prisma.mlmSetting.upsert({
    where: { keyName: "commission_plan" },
    update: {
      valueJson: JSON.stringify([
        { rankLabel: 10, baseRate: 0, monthlyCap: null },
        { rankLabel: 14, baseRate: 4, monthlyCap: 4500 },
        { rankLabel: 19, baseRate: 9, monthlyCap: 9000 },
        { rankLabel: 24, baseRate: 24, monthlyCap: null },
        { rankLabel: 29, baseRate: 29, monthlyCap: null },
        { rankLabel: 38, baseRate: 38, monthlyCap: null },
        { rankLabel: 41, baseRate: 41, monthlyCap: null },
      ]),
      description: "Rank differential unilevel compensation plan from Free Signup through Junior Sales Executive.",
    },
    create: {
      keyName: "commission_plan",
      valueJson: JSON.stringify([
        { rankLabel: 10, baseRate: 0, monthlyCap: null },
        { rankLabel: 14, baseRate: 4, monthlyCap: 4500 },
        { rankLabel: 19, baseRate: 9, monthlyCap: 9000 },
        { rankLabel: 24, baseRate: 24, monthlyCap: null },
        { rankLabel: 29, baseRate: 29, monthlyCap: null },
        { rankLabel: 38, baseRate: 38, monthlyCap: null },
        { rankLabel: 41, baseRate: 41, monthlyCap: null },
      ]),
      description: "Rank differential unilevel compensation plan from Free Signup through Junior Sales Executive.",
    },
  });

  await prisma.mlmSetting.upsert({
    where: { keyName: "rank_cap_period" },
    update: {
      valueJson: JSON.stringify({ period: "MONTHLY" }),
      description: "Configurable period for Fashion Influencer and Vision Influencer earning caps. Business period is unconfirmed.",
    },
    create: {
      keyName: "rank_cap_period",
      valueJson: JSON.stringify({ period: "MONTHLY" }),
      description: "Configurable period for Fashion Influencer and Vision Influencer earning caps. Business period is unconfirmed.",
    },
  });

  await prisma.mlmSetting.upsert({
    where: { keyName: "promotion_leg_mode" },
    update: {
      valueJson: JSON.stringify({ mode: "DIRECT_ONLY" }),
      description: "Configurable promotion leg interpretation. Change to ANY_DEPTH_IN_LEG only after business confirmation.",
    },
    create: {
      keyName: "promotion_leg_mode",
      valueJson: JSON.stringify({ mode: "DIRECT_ONLY" }),
      description: "Configurable promotion leg interpretation. Change to ANY_DEPTH_IN_LEG only after business confirmation.",
    },
  });

  await prisma.mlmSetting.upsert({
    where: { keyName: "group_incentive_plan" },
    update: {
      valueJson: JSON.stringify([
        { rankPercent: 38, generations: [7, 4.5, 3, 2, 1], enabled: true, base: "SPECIAL_DIFFERENTIAL_APPROVED_SUBSCRIPTION" },
        { rankPercent: 41, generations: [8.25, 6.25, 4.5, 2.5, 1], enabled: true, base: "SPECIAL_DIFFERENTIAL_APPROVED_SUBSCRIPTION" },
      ]),
      description: "Confirmed Rank 38 and Rank 41 special differential sequences with subscription/admin approval skip behavior.",
    },
    create: {
      keyName: "group_incentive_plan",
      valueJson: JSON.stringify([
        { rankPercent: 38, generations: [7, 4.5, 3, 2, 1], enabled: true, base: "SPECIAL_DIFFERENTIAL_APPROVED_SUBSCRIPTION" },
        { rankPercent: 41, generations: [8.25, 6.25, 4.5, 2.5, 1], enabled: true, base: "SPECIAL_DIFFERENTIAL_APPROVED_SUBSCRIPTION" },
      ]),
      description: "Confirmed Rank 38 and Rank 41 special differential sequences with subscription/admin approval skip behavior.",
    },
  });

  await prisma.mlmSetting.upsert({
    where: { keyName: "reward_plan" },
    update: {
      valueJson: JSON.stringify([
        { key: "rank-14-starter", rankPercent: 14, title: "Fashion Influencer Starter Reward", condition: "Fashion Influencer with self shopping BV", reward: "Fashion voucher test reward" },
        { key: "rank-19-growth", rankPercent: 19, title: "Vision Influencer Growth Reward", condition: "Vision Influencer team growth", reward: "Silver gift test reward" },
        { key: "rank-24-license", rankPercent: 24, title: "Promoter License Reward", condition: "Promoter license eligibility", reward: "10 license pool test reward" },
        { key: "rank-29-leader", rankPercent: 29, title: "Sales Executive Leader Reward", condition: "Sales Executive leadership business", reward: "Gold bonus test reward" },
        { key: "rank-38-gpg", rankPercent: 38, title: "Junior Sales Executive GPG Reward", condition: "Junior Sales Executive GPG eligibility", reward: "GPG access test reward" },
      ]),
      description: "Demo reward plan for testing all visible rank reward states.",
    },
    create: {
      keyName: "reward_plan",
      valueJson: JSON.stringify([
        { key: "rank-14-starter", rankPercent: 14, title: "Fashion Influencer Starter Reward", condition: "Fashion Influencer with self shopping BV", reward: "Fashion voucher test reward" },
        { key: "rank-19-growth", rankPercent: 19, title: "Vision Influencer Growth Reward", condition: "Vision Influencer team growth", reward: "Silver gift test reward" },
        { key: "rank-24-license", rankPercent: 24, title: "Promoter License Reward", condition: "Promoter license eligibility", reward: "10 license pool test reward" },
        { key: "rank-29-leader", rankPercent: 29, title: "Sales Executive Leader Reward", condition: "Sales Executive leadership business", reward: "Gold bonus test reward" },
        { key: "rank-38-gpg", rankPercent: 38, title: "Junior Sales Executive GPG Reward", condition: "Junior Sales Executive GPG eligibility", reward: "GPG access test reward" },
      ]),
      description: "Demo reward plan for testing all visible rank reward states.",
    },
  });
  await prisma.company.upsert({
    where: { id: 1 },
    update: {
      companyName: "Advify Demo Company",
      addressLine: "Demo Business Address",
      city: "Bhopal",
      state: "Madhya Pradesh",
      pincode: "462001",
      email: "support@example.com",
      customerCarePhone: "9876543210",
      website: "https://example.com",
      gstNo: "23ABCDE1234F1Z5",
    },
    create: {
      id: 1,
      companyName: "Advify Demo Company",
      addressLine: "Demo Business Address",
      city: "Bhopal",
      state: "Madhya Pradesh",
      pincode: "462001",
      email: "support@example.com",
      customerCarePhone: "9876543210",
      website: "https://example.com",
      gstNo: "23ABCDE1234F1Z5",
    },
  });

  const shop = await prisma.shop.upsert({
    where: { id: 1 },
    update: {
      shopName: "advify fashion",
      address: "Bhopal",
      phoneNo: "9876543210",
    },
    create: {
      id: 1,
      shopName: "advify fashion",
      address: "Bhopal",
      phoneNo: "9876543210",
    },
  });

  const pinPlan = await prisma.pinPlan.upsert({
    where: { id: 1 },
    update: {
      planName: "Activation License",
      pinValue: 3000,
    },
    create: {
      id: 1,
      planName: "Activation License",
      pinValue: 3000,
    },
  });

  const products = [
    {
      sku: "RHV-SAREE-001",
      name: "Rahuovelia Signature Saree",
      description: "Premium ethnic wear for partner shopping orders.",
      price: 3500,
      offerPrice: 2999,
      pv: 35,
      bv: 3000,
      gstPercent: 5,
      stock: 50,
    },
    {
      sku: "RHV-KURTI-001",
      name: "Designer Kurti Set",
      description: "Daily wear fashion set with business value.",
      price: 2200,
      offerPrice: 1899,
      pv: 22,
      bv: 1900,
      gstPercent: 5,
      stock: 80,
    },
    {
      sku: "RHV-COMBO-001",
      name: "Activation Fashion Combo",
      description: "Starter product combo for new distributors.",
      price: 3000,
      offerPrice: 3000,
      pv: 30,
      bv: 3000,
      gstPercent: 5,
      stock: 100,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }

  const members = [
    {
      regno: "AF10010001",
      username: "suraj",
      firstName: "Suraj",
      lastName: "Admin Sponsor",
      password: "123456",
      sponsorId: null,
      rankId: 5,
      mobileNo: "8077348757",
      emailId: "suraj@example.com",
      panNo: "ABCDE1234F",
      aadhaarNo: "123412341234",
      bankName: "HDFC Bank",
      accountNo: "1000000001",
      ifscCode: "HDFC0001234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-01"),
      paidDate: date("2026-07-01"),
    },
    {
      regno: "AF10020001",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      password: "123456",
      sponsorId: "AF10010001",
      rankId: 1,
      mobileNo: "9876543210",
      emailId: "test@example.com",
      panNo: "ABCDE2234F",
      aadhaarNo: "223412341234",
      bankName: "SBI",
      accountNo: "2000000001",
      ifscCode: "SBIN0001234",
      planAmount: 3000,
      status: 0,
      loginFlag: false,
      doj: date("2026-07-20"),
    },
    {
      regno: "AF10020002",
      username: "activeuser",
      firstName: "Active",
      lastName: "Member",
      password: "123456",
      sponsorId: "AF10010001",
      rankId: 2,
      mobileNo: "9876543211",
      emailId: "active@example.com",
      panNo: "ABCDE3234F",
      aadhaarNo: "323412341234",
      bankName: "ICICI Bank",
      accountNo: "3000000001",
      ifscCode: "ICIC0001234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-15"),
      paidDate: date("2026-07-15"),
    },
    {
      regno: "AF10020003",
      username: "blockeduser",
      firstName: "Blocked",
      lastName: "Member",
      password: "123456",
      sponsorId: "AF10020002",
      rankId: 1,
      mobileNo: "9876543212",
      emailId: "blocked@example.com",
      panNo: "ABCDE4234F",
      aadhaarNo: "423412341234",
      planAmount: 0,
      status: 2,
      loginFlag: false,
      doj: date("2026-07-18"),
    },
    {
      regno: "AF10020004",
      username: "rank24user",
      firstName: "Kavya",
      lastName: "Rank24",
      password: "123456",
      sponsorId: "AF10010001",
      rankId: 3,
      mobileNo: "9876543213",
      emailId: "kavya.rank24@example.com",
      panNo: "ABCDE5234F",
      aadhaarNo: "523412341234",
      bankName: "Axis Bank",
      accountNo: "4000000001",
      ifscCode: "UTIB0001234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-10"),
      paidDate: date("2026-07-10"),
    },
    {
      regno: "AF10020005",
      username: "rank29user",
      firstName: "Niraj",
      lastName: "Rank29",
      password: "123456",
      sponsorId: "AF10010001",
      rankId: 4,
      mobileNo: "9876543214",
      emailId: "niraj.rank29@example.com",
      panNo: "ABCDE6234F",
      aadhaarNo: "623412341234",
      bankName: "Kotak Bank",
      accountNo: "5000000001",
      ifscCode: "KKBK0001234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-08"),
      paidDate: date("2026-07-08"),
    },
    {
      regno: "AF10020006",
      username: "rank38user",
      firstName: "Saraswati",
      lastName: "Rank38",
      password: "123456",
      sponsorId: "AF10010001",
      rankId: 5,
      mobileNo: "9876543215",
      emailId: "saraswati.rank38@example.com",
      panNo: "ABCDE7234F",
      aadhaarNo: "723412341234",
      bankName: "PNB",
      accountNo: "6000000001",
      ifscCode: "PUNB0001234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-05"),
      paidDate: date("2026-07-05"),
      rank38AchievedAt: date("2026-07-20"),
    },
    {
      regno: "AF10020007",
      username: "rank41user",
      firstName: "Meera",
      lastName: "Rank41",
      password: "123456",
      sponsorId: "AF10010001",
      rankId: 6,
      mobileNo: "9876543216",
      emailId: "meera.rank41@example.com",
      panNo: "ABCDE8234F",
      aadhaarNo: "823412341234",
      bankName: "Canara Bank",
      accountNo: "7000000001",
      ifscCode: "CNRB0001234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-03"),
      paidDate: date("2026-07-03"),
      rank38AchievedAt: date("2026-07-15"),
    },
    {
      regno: "AF10030001",
      username: "level2a",
      firstName: "Rohan",
      lastName: "Level2A",
      password: "123456",
      sponsorId: "AF10020002",
      rankId: 1,
      mobileNo: "9876543217",
      emailId: "rohan.level2a@example.com",
      panNo: "ABCDE9234F",
      aadhaarNo: "923412341234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-21"),
      paidDate: date("2026-07-21"),
    },
    {
      regno: "AF10030002",
      username: "level2b",
      firstName: "Priya",
      lastName: "Level2B",
      password: "123456",
      sponsorId: "AF10020002",
      rankId: 2,
      mobileNo: "9876543218",
      emailId: "priya.level2b@example.com",
      panNo: "ABCDF1234F",
      aadhaarNo: "103412341234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-22"),
      paidDate: date("2026-07-22"),
    },
    {
      regno: "AF10030003",
      username: "level2c",
      firstName: "Aarav",
      lastName: "Level2C",
      password: "123456",
      sponsorId: "AF10020004",
      rankId: 3,
      mobileNo: "9876543219",
      emailId: "aarav.level2c@example.com",
      panNo: "ABCDF2234F",
      aadhaarNo: "113412341234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-23"),
      paidDate: date("2026-07-23"),
    },
    {
      regno: "AF10030004",
      username: "level2d",
      firstName: "Isha",
      lastName: "Level2D",
      password: "123456",
      sponsorId: "AF10020005",
      rankId: 4,
      mobileNo: "9876543220",
      emailId: "isha.level2d@example.com",
      panNo: "ABCDF3234F",
      aadhaarNo: "123512341234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-24"),
      paidDate: date("2026-07-24"),
    },
    {
      regno: "AF10030005",
      username: "level2e",
      firstName: "Dev",
      lastName: "Level2E",
      password: "123456",
      sponsorId: "AF10020006",
      rankId: 5,
      mobileNo: "9876543221",
      emailId: "dev.level2e@example.com",
      panNo: "ABCDF4234F",
      aadhaarNo: "133412341234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-25"),
      paidDate: date("2026-07-25"),
      rank38AchievedAt: date("2026-08-01"),
    },
    {
      regno: "AF10040001",
      username: "level3a",
      firstName: "Tara",
      lastName: "Level3A",
      password: "123456",
      sponsorId: "AF10030001",
      rankId: 8,
      mobileNo: "9876543222",
      emailId: "tara.level3a@example.com",
      panNo: "ABCDF5234F",
      aadhaarNo: "143412341234",
      planAmount: 0,
      status: 0,
      loginFlag: false,
      doj: date("2026-07-26"),
    },
    {
      regno: "AF10040002",
      username: "level3b",
      firstName: "Kabir",
      lastName: "Level3B",
      password: "123456",
      sponsorId: "AF10030001",
      rankId: 1,
      mobileNo: "9876543223",
      emailId: "kabir.level3b@example.com",
      panNo: "ABCDF6234F",
      aadhaarNo: "153412341234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-27"),
      paidDate: date("2026-07-27"),
    },
    {
      regno: "AF10050001",
      username: "level4a",
      firstName: "Anaya",
      lastName: "Level4A",
      password: "123456",
      sponsorId: "AF10040002",
      rankId: 2,
      mobileNo: "9876543224",
      emailId: "anaya.level4a@example.com",
      panNo: "ABCDF7234F",
      aadhaarNo: "163412341234",
      planAmount: 3000,
      status: 1,
      loginFlag: true,
      doj: date("2026-07-28"),
      paidDate: date("2026-07-28"),
    },
  ];

  for (const member of members) {
    const memberData = {
      ...member,
      gpgPaidUntil: date("2099-12-31"),
      licensesRemaining: [3, 4, 5].includes(member.rankId) ? 10 : 0,
    };
    await prisma.member.upsert({
      where: { regno: member.regno },
      update: memberData,
      create: memberData,
    });
  }

  const seededMembers = await prisma.member.findMany({
    where: { regno: { in: members.map((member) => member.regno) } },
  });

  for (const member of seededMembers) {
    await prisma.panVerification.upsert({
      where: { memberId: member.id },
      update: {
        panNo: member.panNo,
        panImage: `/uploads/pan/${member.regno}.jpg`,
        status: member.regno === "AF10020001" ? "Pending" : "Verified",
        verifiedBy: member.regno === "AF10020001" ? null : "Admin",
        verifiedDate: member.regno === "AF10020001" ? null : new Date(),
      },
      create: {
        memberId: member.id,
        panNo: member.panNo,
        panImage: `/uploads/pan/${member.regno}.jpg`,
        status: member.regno === "AF10020001" ? "Pending" : "Verified",
        verifiedBy: member.regno === "AF10020001" ? null : "Admin",
        verifiedDate: member.regno === "AF10020001" ? null : new Date(),
      },
    });
  }

  const seedRegnos = members.map((member) => member.regno);
  const membersByRegno = new Map(members.map((member) => [member.regno, member]));

  await prisma.memberGenealogy.deleteMany({
    where: {
      OR: [
        { ancestorRegno: { in: seedRegnos } },
        { descendantRegno: { in: seedRegnos } },
      ],
    },
  });

  const genealogyRows = [];
  for (const member of members) {
    genealogyRows.push({ ancestorRegno: member.regno, descendantRegno: member.regno, depth: 0 });
    let depth = 1;
    let sponsorId = member.sponsorId;
    while (sponsorId && membersByRegno.has(sponsorId)) {
      genealogyRows.push({ ancestorRegno: sponsorId, descendantRegno: member.regno, depth });
      sponsorId = membersByRegno.get(sponsorId).sponsorId;
      depth += 1;
    }
  }

  await prisma.memberGenealogy.createMany({
    data: genealogyRows,
    skipDuplicates: true,
  });

  await prisma.downlineBusiness.deleteMany({
    where: {
      OR: [
        { regno: { in: seedRegnos } },
        { downlineRegno: { in: seedRegnos } },
      ],
    },
  });

  const businessRows = genealogyRows
    .filter((row) => row.depth > 0)
    .map((row) => ({
      regno: row.ancestorRegno,
      downlineRegno: row.descendantRegno,
      businessAmount: Number(membersByRegno.get(row.descendantRegno)?.planAmount || 0) + row.depth * 1750,
      fromDate: date("2026-07-01"),
      toDate: date("2026-07-31"),
    }));

  await prisma.downlineBusiness.createMany({
    data: businessRows,
  });

  await prisma.order.upsert({
    where: { orderId: "ORD1000001" },
    update: {
      totalAmount: 28000,
      pv: 1600,
      bv: 25000,
      approvedStatus: 1,
    },
    create: {
      orderId: "ORD1000001",
      regno: "AF10020002",
      name: "Active Member",
      shopId: shop.id,
      pv: 1600,
      totalAmount: 28000,
      bv: 25000,
      saleDate: date("2026-07-24"),
      approvedStatus: 1,
      paymentMode: "UPI",
      totalGst: 5040,
      totalWithGst: 28000,
      shippingCost: 0,
      subTotalAmount: 22960,
      items: {
        create: [
          {
            slNo: 1,
            productDescription: "Demo Fashion Product",
            price: 28000,
            offerPrice: 28000,
            discountPercent: 0,
            size: "M",
            quantity: 1,
            grossAmount: 28000,
            gst: 5040,
          },
        ],
      },
    },
  });

  await prisma.onlineTransaction.upsert({
    where: { amountTxnId: "ordv2_demo_1000001" },
    update: {
      transactionAmount: 28000,
      txnDate: date("2026-07-24"),
    },
    create: {
      regno: "AF10020002",
      name: "Active Member",
      mobile: "9876543211",
      amountTxnId: "ordv2_demo_1000001",
      orderId: "ORD1000001",
      transactionAmount: 28000,
      txnDate: date("2026-07-24"),
    },
  });

  const extraOrders = [
    { orderId: "ORD1000002", regno: "AF10020001", name: "Test User", pv: 120, totalAmount: 12000, bv: 10000, saleDate: date("2026-07-25"), approvedStatus: 0, paymentMode: "Wallet" },
    { orderId: "ORD1000003", regno: "AF10020004", name: "Kavya Rank24", pv: 240, totalAmount: 24000, bv: 22000, saleDate: date("2026-07-26"), approvedStatus: 1, paymentMode: "Wallet" },
    { orderId: "ORD1000004", regno: "AF10020005", name: "Niraj Rank29", pv: 320, totalAmount: 32000, bv: 30000, saleDate: date("2026-07-27"), approvedStatus: 1, paymentMode: "UPI" },
    { orderId: "ORD1000005", regno: "AF10020006", name: "Saraswati Rank38", pv: 500, totalAmount: 50000, bv: 47000, saleDate: date("2026-07-28"), approvedStatus: 1, paymentMode: "Wallet" },
    { orderId: "ORD1000006", regno: "AF10030005", name: "Dev Level2E", pv: 380, totalAmount: 38000, bv: 35000, saleDate: date("2026-07-29"), approvedStatus: 1, paymentMode: "UPI" },
    { orderId: "ORD1000007", regno: "AF10050001", name: "Anaya Level4A", pv: 160, totalAmount: 16000, bv: 14000, saleDate: date("2026-07-30"), approvedStatus: 1, paymentMode: "Wallet" },
  ];

  for (const order of extraOrders) {
    await prisma.order.upsert({
      where: { orderId: order.orderId },
      update: order,
      create: {
        ...order,
        shopId: shop.id,
        totalGst: Number(order.totalAmount) * 0.05,
        totalWithGst: order.totalAmount,
        shippingCost: 0,
        subTotalAmount: Number(order.totalAmount) * 0.95,
        items: {
          create: [
            {
              slNo: 1,
              productDescription: `${order.name} Demo Cart`,
              price: order.totalAmount,
              offerPrice: order.totalAmount,
              discountPercent: 0,
              size: "L",
              quantity: 1,
              grossAmount: order.totalAmount,
              gst: Number(order.totalAmount) * 0.05,
            },
          ],
        },
      },
    });
  }

  const commissionOrders = await prisma.order.findMany({
    where: { orderId: { in: ["ORD1000001", ...extraOrders.map((order) => order.orderId)] } },
    select: { id: true, orderId: true, regno: true, bv: true },
  });

  await prisma.commission.deleteMany({
    where: {
      OR: [
        { earnerRegno: { in: seedRegnos } },
        { sourceRegno: { in: seedRegnos } },
        { sourceKey: { startsWith: "seed_" } },
      ],
    },
  });

  const commissionRows = commissionOrders.flatMap((order, index) => [
    {
      orderId: order.id,
      earnerRegno: "AF10010001",
      sourceRegno: order.regno,
      level: 1,
      type: "Rank Differential",
      baseAmount: Number(order.bv || 0),
      percentage: 4 + index,
      amount: 450 + index * 120,
      sourceKey: `seed_root_${order.orderId}`,
      reasonCode: "DEMO_ROOT_DIFFERENTIAL",
      rankLabel: 38,
      lowerRankLabel: 14,
    },
    {
      orderId: order.id,
      earnerRegno: "AF10020006",
      sourceRegno: order.regno,
      level: 2,
      type: "Group Incentive",
      baseAmount: Number(order.bv || 0),
      percentage: 7,
      amount: 250 + index * 80,
      sourceKey: `seed_gpg_${order.orderId}`,
      reasonCode: "DEMO_GPG",
      rankLabel: 38,
      lowerRankLabel: 29,
      gpgSlot: (index % 5) + 1,
    },
  ]);

  await prisma.commission.createMany({
    data: commissionRows,
  });

  await prisma.walletLedger.deleteMany({ where: { regno: { in: seedRegnos } } });
  await prisma.walletLedger.createMany({
    data: [
      { regno: "AF10020001", type: "Add Fund", description: "Pending online fund request demo", amount: 5000, balance: 5000, referenceId: "WALLET-DEMO-001", createdAt: date("2026-07-25") },
      { regno: "AF10020002", type: "Shopping Wallet", description: "Shopping wallet top-up demo", amount: 34871.97, balance: 34871.97, referenceId: "WALLET-DEMO-002", createdAt: date("2026-07-26") },
      { regno: "AF10010001", type: "Commission", description: "Rank Differential from demo team", amount: 6200, balance: 6200, referenceId: "WALLET-DEMO-003", createdAt: date("2026-07-27") },
      { regno: "AF10020006", type: "Commission", description: "GPG group incentive demo", amount: 4100, balance: 4100, referenceId: "WALLET-DEMO-004", createdAt: date("2026-07-28") },
      { regno: "AF10050001", type: "Purchase", description: "Wallet checkout demo", amount: -16000, balance: 1200, referenceId: "WALLET-DEMO-005", createdAt: date("2026-07-30") },
    ],
  });

  await prisma.rankHistory.deleteMany({ where: { regno: { in: seedRegnos } } });
  await prisma.rankHistory.createMany({
    data: [
      { regno: "AF10020001", oldRankId: 8, newRankId: 1, oldRankName: "Free Signup", newRankName: "Fashion Influencer", oldPercent: 10, newPercent: 14, promotionReason: "DEMO_SELF_SHOPPING", changedById: admin.id, createdAt: date("2026-07-25") },
      { regno: "AF10020002", oldRankId: 1, newRankId: 2, oldRankName: "Fashion Influencer", newRankName: "Vision Influencer", oldPercent: 14, newPercent: 19, promotionReason: "DEMO_TEAM_BUSINESS", changedById: admin.id, createdAt: date("2026-07-26") },
      { regno: "AF10020004", oldRankId: 2, newRankId: 3, oldRankName: "Vision Influencer", newRankName: "Promoter", oldPercent: 19, newPercent: 24, promotionReason: "DEMO_LICENSE_POOL", changedById: admin.id, createdAt: date("2026-07-27") },
      { regno: "AF10020005", oldRankId: 3, newRankId: 4, oldRankName: "Promoter", newRankName: "Sales Executive", oldPercent: 24, newPercent: 29, promotionReason: "DEMO_LEADERSHIP", changedById: admin.id, createdAt: date("2026-07-28") },
      { regno: "AF10020006", oldRankId: 4, newRankId: 5, oldRankName: "Sales Executive", newRankName: "Junior Sales Executive", oldPercent: 29, newPercent: 38, promotionReason: "DEMO_GPG_READY", changedById: admin.id, createdAt: date("2026-07-29") },
      { regno: "AF10020007", oldRankId: 5, newRankId: 6, oldRankName: "Junior Sales Executive", newRankName: "Senior Sales Executive", oldPercent: 38, newPercent: 41, promotionReason: "DEMO_CHALLENGE", changedById: admin.id, createdAt: date("2026-07-30") },
    ],
  });

  await prisma.rewardClaim.deleteMany({ where: { regno: { in: seedRegnos } } });
  await prisma.rewardClaim.createMany({
    data: [
      { regno: "AF10020001", rewardKey: "rank-14-starter", title: "Fashion Influencer Starter Reward", conditionText: "Fashion Influencer with self shopping BV", rewardText: "Fashion voucher test reward", rankPercent: 14, selfBv: 10000, teamBv: 16000, status: "Pending" },
      { regno: "AF10020004", rewardKey: "rank-24-license", title: "Promoter License Reward", conditionText: "Promoter license eligibility", rewardText: "10 license pool test reward", rankPercent: 24, selfBv: 22000, teamBv: 42000, status: "Approved", approvedAt: date("2026-07-28") },
      { regno: "AF10020005", rewardKey: "rank-29-leader", title: "Sales Executive Leader Reward", conditionText: "Sales Executive leadership business", rewardText: "Gold bonus test reward", rankPercent: 29, selfBv: 30000, teamBv: 58000, status: "Paid", approvedAt: date("2026-07-29"), paidAt: date("2026-07-30") },
      { regno: "AF10020006", rewardKey: "rank-38-gpg", title: "Junior Sales Executive GPG Reward", conditionText: "Junior Sales Executive GPG eligibility", rewardText: "GPG access test reward", rankPercent: 38, selfBv: 47000, teamBv: 89000, status: "Rejected", rejectedAt: date("2026-07-31"), remarks: "Demo rejected state" },
    ],
  });

  await prisma.gpgSubscription.deleteMany({ where: { regno: { in: seedRegnos } } });
  await prisma.gpgSubscription.createMany({
    data: [
      { regno: "AF10020006", cycleKey: "2026-07-20", rankLabel: 38, subscribedAt: date("2026-07-20T09:05:23"), approvalStatus: "Approved", approvedAt: date("2026-07-21"), approvedById: admin.id, accessNumber: 1, accessPercentage: 7, assignmentMode: "MANUAL", assignedAt: date("2026-07-21T10:00:00"), metadataJson: JSON.stringify({ source: "SEED_APPROVED" }) },
      { regno: "AF10020006", cycleKey: "2026-08-20", rankLabel: 38, subscribedAt: date("2026-08-20T09:05:23"), approvalStatus: "Pending", metadataJson: JSON.stringify({ source: "SEED_PENDING" }) },
      { regno: "AF10030005", cycleKey: "2026-08-20", rankLabel: 38, subscribedAt: date("2026-08-20T09:15:23"), approvalStatus: "Rejected", rejectedAt: date("2026-08-21"), metadataJson: JSON.stringify({ source: "SEED_REJECTED" }) },
      { regno: "AF10020007", cycleKey: "2026-08-20", rankLabel: 41, subscribedAt: date("2026-08-20T09:10:23"), approvalStatus: "Approved", approvedAt: date("2026-08-21"), approvedById: admin.id, accessNumber: 1, accessPercentage: 8.25, assignmentMode: "AUTO", assignedAt: date("2026-08-21T10:05:00"), metadataJson: JSON.stringify({ source: "SEED_RANK41" }) },
    ],
  });

  await prisma.licenseUsage.deleteMany({
    where: {
      OR: [
        { giverRegno: { in: seedRegnos } },
        { receiverRegno: { in: seedRegnos } },
      ],
    },
  });
  await prisma.licenseUsage.createMany({
    data: [
      { giverRegno: "AF10020004", giverRankAtTime: 24, receiverRegno: "AF10030003", receiverPreviousRank: 19, receiverNewRank: 24, licenseSequence: 1, referenceId: "LIC-DEMO-001", metadataJson: JSON.stringify({ source: "SEED" }), createdAt: date("2026-07-27") },
      { giverRegno: "AF10020005", giverRankAtTime: 29, receiverRegno: "AF10030004", receiverPreviousRank: 24, receiverNewRank: 29, licenseSequence: 2, referenceId: "LIC-DEMO-002", metadataJson: JSON.stringify({ source: "SEED" }), createdAt: date("2026-07-28") },
    ],
  });

  await prisma.rankChallenge.deleteMany({ where: { regno: { in: seedRegnos } } });
  await prisma.rankChallenge.createMany({
    data: [
      { regno: "AF10020006", challengeType: "RANK_41", status: "Active", startedAt: date("2026-08-01"), endsAt: date("2026-10-31"), requiredBv: 1490000, currentBv: 725000, metadataJson: JSON.stringify({ source: "SEED_ACTIVE" }) },
      { regno: "AF10020007", challengeType: "RANK_41", status: "Completed", startedAt: date("2026-07-01"), endsAt: date("2026-09-30"), requiredBv: 1490000, currentBv: 1510000, completedAt: date("2026-07-30"), metadataJson: JSON.stringify({ source: "SEED_COMPLETED" }) },
      { regno: "AF10030005", challengeType: "RANK_41", status: "Expired", startedAt: date("2026-04-01"), endsAt: date("2026-06-30"), requiredBv: 1490000, currentBv: 900000, metadataJson: JSON.stringify({ source: "SEED_EXPIRED" }) },
    ],
  });

  await prisma.payout.deleteMany({
    where: { regno: { in: ["AF10010001", "AF10020002"] } },
  });

  await prisma.payout.createMany({
    data: [
      {
        regno: "AF10010001",
        name: "Suraj Admin Sponsor",
        generationBonus: 1000,
        levelBonus: 500,
        totalAmount: 1500,
        tds: 30,
        adminCharge: 45,
        netAmount: 1425,
        bankName: "HDFC Bank",
        accountNo: "1000000001",
        ifscCode: "HDFC0001234",
        mobile: "8077348757",
        aadhaarNo: "123412341234",
        panNo: "ABCDE1234F",
        status: 0,
      },
      {
        regno: "AF10020002",
        name: "Active Member",
        generationBonus: 800,
        levelBonus: 200,
        totalAmount: 1000,
        tds: 20,
        adminCharge: 30,
        netAmount: 950,
        bankName: "ICICI Bank",
        accountNo: "3000000001",
        ifscCode: "ICIC0001234",
        mobile: "9876543211",
        aadhaarNo: "323412341234",
        panNo: "ABCDE3234F",
        paymentDate: date("2026-07-28"),
        status: 1,
      },
    ],
  });

  const demoPins = await prisma.pin.findMany({
    where: { pinNo: { in: ["2168000000001", "2168000000002", "2168000000003", "2168000000004"] } },
    select: { id: true },
  });
  const demoPinIds = demoPins.map((pin) => pin.id);
  await prisma.pinUsage.deleteMany({ where: { pinId: { in: demoPinIds } } });
  await prisma.pinTransfer.deleteMany({ where: { pinId: { in: demoPinIds } } });
  await prisma.pin.deleteMany({ where: { id: { in: demoPinIds } } });

  await prisma.pin.createMany({
    data: [
      {
        pinSlNo: 90001,
        pinNo: "2168000000001",
        planId: pinPlan.id,
        pinValue: 3000,
        generatedDate: date("2026-07-27"),
        generatedByAdminId: admin.id,
        activeStatus: true,
      },
      {
        pinSlNo: 90002,
        pinNo: "2168000000002",
        planId: pinPlan.id,
        pinValue: 3000,
        generatedDate: date("2026-07-27"),
        generatedByAdminId: admin.id,
        activeStatus: true,
      },
      {
        pinSlNo: 90003,
        pinNo: "2168000000003",
        planId: pinPlan.id,
        pinValue: 3000,
        generatedDate: date("2026-07-27"),
        generatedByAdminId: admin.id,
        transferStatus: true,
        activeStatus: true,
      },
      {
        pinSlNo: 90004,
        pinNo: "2168000000004",
        planId: pinPlan.id,
        pinValue: 3000,
        generatedDate: date("2026-07-27"),
        generatedByAdminId: admin.id,
        transferStatus: true,
        usedStatus: true,
        activeStatus: true,
      },
    ],
  });

  const transferredPin = await prisma.pin.findUnique({ where: { pinNo: "2168000000003" } });
  const usedPin = await prisma.pin.findUnique({ where: { pinNo: "2168000000004" } });

  await prisma.pinTransfer.createMany({
    data: [
      {
        pinId: transferredPin.id,
        fromAdminId: admin.id,
        toRegno: "AF10020001",
        toName: "Test User",
        pinTypeValue: 3000,
        noOfPins: 1,
        transferDate: date("2026-07-28"),
      },
      {
        pinId: usedPin.id,
        fromAdminId: admin.id,
        toRegno: "AF10020002",
        toName: "Active Member",
        pinTypeValue: 3000,
        noOfPins: 1,
        transferDate: date("2026-07-28"),
      },
    ],
  });

  await prisma.pinUsage.create({
    data: {
      pinId: usedPin.id,
      usedByRegno: "AF10020002",
      usedByName: "Active Member",
      usedForRegno: "AF10020002",
      usedForName: "Active Member",
      usedDate: date("2026-07-29"),
    },
  });

  const demoTickets = await prisma.helpDeskMessage.findMany({
    where: { regno: { in: ["AF10020001", "AF10020002"] } },
    select: { id: true },
  });
  await prisma.helpDeskReply.deleteMany({
    where: { messageId: { in: demoTickets.map((ticket) => ticket.id) } },
  });
  await prisma.helpDeskMessage.deleteMany({
    where: { id: { in: demoTickets.map((ticket) => ticket.id) } },
  });

  const ticket = await prisma.helpDeskMessage.create({
    data: {
      regno: "AF10020001",
      subject: "Login issue",
      message: "I am unable to login.",
      status: "Open",
    },
  });

  await prisma.helpDeskReply.create({
    data: {
      messageId: ticket.id,
      adminId: admin.id,
      reply: "Please try resetting your password.",
    },
  });

  await prisma.dashboardMessage.create({
    data: {
      adminId: admin.id,
      message: "New payout cycle will start soon.",
      active: true,
    },
  });

  console.log("Seed completed successfully.");
  console.log("Admin login: Admin / suraj@@@");
  console.log("Sample member regnos: AF10010001, AF10020001, AF10020002, AF10020003");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
