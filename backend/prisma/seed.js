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
    { id: 8, rankName: "Free Signup", criteriaBv: 0, levelNo: 0, percentage: 10, selfShoppingAmount: 0 },
    { id: 1, rankName: "Fashion Influencer", criteriaBv: 4500, levelNo: 1, percentage: 14, selfShoppingAmount: 4500 },
    { id: 2, rankName: "Vision Influencer", criteriaBv: 9000, levelNo: 2, percentage: 19, selfShoppingAmount: 9000 },
    { id: 3, rankName: "Promoter", criteriaBv: 22500, levelNo: 3, percentage: 24, selfShoppingAmount: 22500 },
    { id: 4, rankName: "Sales Executive", criteriaBv: 38000, levelNo: 4, percentage: 29, selfShoppingAmount: 38000 },
    { id: 5, rankName: "Junior Sales Executive", criteriaBv: 0, levelNo: 5, percentage: 38, selfShoppingAmount: 38000 },
    { id: 6, rankName: "Senior Sales Executive", criteriaBv: 0, levelNo: 6, percentage: 41, selfShoppingAmount: 38000 },
    {
      id: 7,
      rankName: "Zonal Sales Executive",
      criteriaBv: 0,
      levelNo: 7,
      percentage: 42,
      selfShoppingAmount: 38000,
      challengeBusinessBv: 1490000,
      challengeMonths: 3,
    },
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
      ]),
      description: "Client percentage-rank leg qualification rules from handwritten MLM plan.",
    },
    create: {
      keyName: "rank_leg_rules",
      valueJson: JSON.stringify([
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
      ]),
      description: "Client percentage-rank leg qualification rules from handwritten MLM plan.",
    },
  });

  await prisma.mlmSetting.upsert({
    where: { keyName: "commission_plan" },
    update: {
      valueJson: JSON.stringify([
        { level: 1, type: "Direct Bonus", percentage: 10 },
      ]),
      description: "Free signup direct incentive baseline from client plan.",
    },
    create: {
      keyName: "commission_plan",
      valueJson: JSON.stringify([
        { level: 1, type: "Direct Bonus", percentage: 10 },
      ]),
      description: "Free signup direct incentive baseline from client plan.",
    },
  });

  await prisma.mlmSetting.upsert({
    where: { keyName: "group_incentive_plan" },
    update: {
      valueJson: JSON.stringify([
        { rankPercent: 38, generations: [7, 4.5, 3, 2, 1] },
        { rankPercent: 41, generations: [11.25, 6.25, 4.5, 2.5, 1] },
      ]),
      description: "38% and 41% generation/group incentive percentages from client plan.",
    },
    create: {
      keyName: "group_incentive_plan",
      valueJson: JSON.stringify([
        { rankPercent: 38, generations: [7, 4.5, 3, 2, 1] },
        { rankPercent: 41, generations: [11.25, 6.25, 4.5, 2.5, 1] },
      ]),
      description: "38% and 41% generation/group incentive percentages from client plan.",
    },
  });

  await prisma.mlmSetting.upsert({
    where: { keyName: "reward_plan" },
    update: {
      valueJson: JSON.stringify([
        { rankPercent: 38, title: "Personal BV Case Reward", condition: "Personal BV milestone", reward: "Rs 5,000 case reward" },
        { rankPercent: 38, title: "All Team Business Slab", condition: "38% all team business slab", reward: "Domestic tour" },
        { rankPercent: 41, title: "Personal BV 10 Lakh", condition: "10 lakh personal BV", reward: "Rs 15,000 case reward" },
        { rankPercent: 42, title: "6 Month Rank Achievement", condition: "Achieve 42% rank within 6 months", reward: "Latest iPhone or Rs 2 lakh case reward" },
        { rankPercent: 42, title: "18 Month Rank Achievement", condition: "Achieve 42% rank within 18 months", reward: "Rs 8 lakh car bonus and international family tour, 2 countries" },
      ]),
      description: "Client reward notes for 38%, 41%, and 42% ranks.",
    },
    create: {
      keyName: "reward_plan",
      valueJson: JSON.stringify([
        { rankPercent: 38, title: "Personal BV Case Reward", condition: "Personal BV milestone", reward: "Rs 5,000 case reward" },
        { rankPercent: 38, title: "All Team Business Slab", condition: "38% all team business slab", reward: "Domestic tour" },
        { rankPercent: 41, title: "Personal BV 10 Lakh", condition: "10 lakh personal BV", reward: "Rs 15,000 case reward" },
        { rankPercent: 42, title: "6 Month Rank Achievement", condition: "Achieve 42% rank within 6 months", reward: "Latest iPhone or Rs 2 lakh case reward" },
        { rankPercent: 42, title: "18 Month Rank Achievement", condition: "Achieve 42% rank within 18 months", reward: "Rs 8 lakh car bonus and international family tour, 2 countries" },
      ]),
      description: "Client reward notes for 38%, 41%, and 42% ranks.",
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
  ];

  for (const member of members) {
    await prisma.member.upsert({
      where: { regno: member.regno },
      update: member,
      create: member,
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

  await prisma.downlineBusiness.deleteMany({
    where: {
      regno: "AF10010001",
      downlineRegno: { in: ["AF10020001", "AF10020002", "AF10020003"] },
    },
  });

  await prisma.downlineBusiness.createMany({
    data: [
      {
        regno: "AF10010001",
        downlineRegno: "AF10020001",
        businessAmount: 3000,
        fromDate: date("2026-07-01"),
        toDate: date("2026-07-31"),
      },
      {
        regno: "AF10010001",
        downlineRegno: "AF10020002",
        businessAmount: 28000,
        fromDate: date("2026-07-01"),
        toDate: date("2026-07-31"),
      },
      {
        regno: "AF10010001",
        downlineRegno: "AF10020003",
        businessAmount: 0,
        fromDate: date("2026-07-01"),
        toDate: date("2026-07-31"),
      },
    ],
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
