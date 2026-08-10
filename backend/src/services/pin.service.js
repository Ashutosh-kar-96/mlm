import prisma from "../config/db.js";
import { dateRange, pagination, toInt } from "../utils/query.js";
import { applyRankLicense, processActivationBusiness } from "./mlm.service.js";

const randomPin = () => `${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

export const plans = () => prisma.pinPlan.findMany({ orderBy: { pinValue: "asc" } });

export const createPlan = ({ planName, pinValue }) =>
  prisma.pinPlan.create({
    data: {
      planName,
      pinValue: Number(pinValue),
    },
  });

export const updatePlan = (id, { planName, pinValue }) =>
  prisma.pinPlan.update({
    where: { id: Number(id) },
    data: {
      ...(planName !== undefined ? { planName } : {}),
      ...(pinValue !== undefined ? { pinValue: Number(pinValue) } : {}),
    },
  });

export const generatePins = async ({ planId, pinValue, noOfPins }, adminId) => {
  const plan = planId
    ? await prisma.pinPlan.findUnique({ where: { id: Number(planId) } })
    : await prisma.pinPlan.findFirst({ where: { pinValue: Number(pinValue) } });
  if (!plan) {
    const error = new Error("Pin plan not found");
    error.status = 404;
    throw error;
  }

  const lastPin = await prisma.pin.findFirst({ orderBy: { pinSlNo: "desc" } });
  const count = Math.min(Math.max(toInt(noOfPins, 1), 1), 500);
  const start = (lastPin?.pinSlNo || 10000) + 1;

  const data = Array.from({ length: count }, (_, index) => ({
    pinSlNo: start + index,
    pinNo: randomPin() + index,
    planId: plan.id,
    pinValue: plan.pinValue,
    generatedDate: new Date(),
    generatedByAdminId: Number(adminId),
  }));

  await prisma.pin.createMany({ data });
  return { generated: count, fromPinSlNo: start, toPinSlNo: start + count - 1 };
};

export const listPins = async (query) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.planId ? { planId: Number(query.planId) } : {}),
    ...(query.pinValue ? { pinValue: Number(query.pinValue) } : {}),
    ...(query.activeStatus !== undefined ? { activeStatus: query.activeStatus === "true" } : {}),
    ...(query.transferStatus !== undefined ? { transferStatus: query.transferStatus === "true" } : {}),
    ...(query.usedStatus !== undefined ? { usedStatus: query.usedStatus === "true" } : {}),
    ...dateRange("generatedDate", query.fromDate, query.toDate),
  };

  const [items, total] = await Promise.all([
    prisma.pin.findMany({
      where,
      skip,
      take,
      include: { plan: true, transfer: true, usage: true },
      orderBy: { pinSlNo: "desc" },
    }),
    prisma.pin.count({ where }),
  ]);

  return { items, meta: { page, limit, total } };
};
export const setActive = (ids, activeStatus) =>
  prisma.pin.updateMany({
    where: { id: { in: ids.map(Number) } },
    data: { activeStatus },
  });

export const transferPins = async ({ toRegno, planId, pinValue, noOfPins }, adminId) => {
  const member = await prisma.member.findUnique({ where: { regno: toRegno } });
  if (!member) {
    const error = new Error("Recipient member not found");
    error.status = 404;
    throw error;
  }

  const count = Math.max(toInt(noOfPins, 1), 1);
  const pins = await prisma.pin.findMany({
    where: {
      activeStatus: true,
      transferStatus: false,
      usedStatus: false,
      ...(planId ? { planId: Number(planId) } : {}),
      ...(pinValue ? { pinValue: Number(pinValue) } : {}),
    },
    orderBy: { pinSlNo: "asc" },
    take: count,
  });

  if (pins.length < count) {
    const error = new Error("Not enough available pins");
    error.status = 400;
    throw error;
  }

  await prisma.$transaction([
    prisma.pinTransfer.createMany({
      data: pins.map((pin) => ({
        pinId: pin.id,
        fromAdminId: Number(adminId),
        toRegno,
        toName: [member.firstName, member.lastName].filter(Boolean).join(" "),
        pinTypeValue: pin.pinValue,
        noOfPins: count,
      })),
    }),
    prisma.pin.updateMany({
      where: { id: { in: pins.map((pin) => pin.id) } },
      data: { transferStatus: true },
    }),
  ]);

  return { transferred: pins.length, toRegno };
};

export const usePin = async ({ pinNo, usedByRegno, usedForRegno }, actorRole = "user") => {
  const pin = await prisma.pin.findUnique({ where: { pinNo }, include: { transfer: true, usage: true } });
  if (!pin || !pin.activeStatus || pin.usedStatus) {
    const error = new Error("Pin is not available");
    error.status = 400;
    throw error;
  }
  if (!usedByRegno || !usedForRegno) {
    const error = new Error("Member IDs are required for pin usage");
    error.status = 400;
    throw error;
  }
  if (actorRole !== "admin" && pin.transfer?.toRegno !== usedByRegno) {
    const error = new Error("This pin is not assigned to your account");
    error.status = 403;
    throw error;
  }

  const [usedBy, usedFor] = await Promise.all([
    prisma.member.findUnique({ where: { regno: usedByRegno }, include: { rank: true } }),
    prisma.member.findUnique({ where: { regno: usedForRegno }, include: { rank: true } }),
  ]);

  if (!usedBy || !usedFor) {
    const error = new Error("Member not found for pin usage");
    error.status = 404;
    throw error;
  }
  if (usedBy.status === 2 || usedFor.status === 2) {
    const error = new Error("Blocked members cannot use activation pins");
    error.status = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const lockedPin = await tx.pin.findUnique({ where: { pinNo }, include: { transfer: true, usage: true } });
    if (!lockedPin || !lockedPin.activeStatus || lockedPin.usedStatus || lockedPin.usage) {
      const error = new Error("Pin is not available");
      error.status = 400;
      throw error;
    }
    if (actorRole !== "admin" && lockedPin.transfer?.toRegno !== usedByRegno) {
      const error = new Error("This pin is not assigned to your account");
      error.status = 403;
      throw error;
    }

    if (Number(usedBy.rank?.percentage || 0) >= 24) {
      await applyRankLicense({ giverRegno: usedByRegno, recipientRegno: usedForRegno }, tx);
    }

    const usage = await tx.pinUsage.create({
      data: {
        pinId: lockedPin.id,
        usedByRegno,
        usedByName: [usedBy.firstName, usedBy.lastName].filter(Boolean).join(" "),
        usedForRegno,
        usedForName: [usedFor.firstName, usedFor.lastName].filter(Boolean).join(" "),
        usedDate: new Date(),
      },
    });
    await tx.pin.update({ where: { id: lockedPin.id }, data: { usedStatus: true } });
    const activatedMember = await tx.member.update({
      where: { regno: usedForRegno },
      data: {
        status: 1,
        paidDate: new Date(),
        loginFlag: true,
        planAmount: lockedPin.pinValue,
      },
    });
    const activationOrder = await processActivationBusiness({
      pin: lockedPin,
      usedFor: activatedMember,
      usedBy,
    }, tx);
    return { usage, activationOrder };
  });
};

export const transfers = async (query) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.regno ? { toRegno: { contains: query.regno } } : {}),
    ...dateRange("transferDate", query.fromDate, query.toDate),
  };

  const [items, total] = await Promise.all([
    prisma.pinTransfer.findMany({ where, skip, take, include: { pin: { include: { plan: true } }, toMember: true }, orderBy: { transferDate: "desc" } }),
    prisma.pinTransfer.count({ where }),
  ]);

  return { items, meta: { page, limit, total } };
};

export const usedPins = async (query) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.regno ? { OR: [{ usedByRegno: { contains: query.regno } }, { usedForRegno: { contains: query.regno } }] } : {}),
    ...dateRange("usedDate", query.fromDate, query.toDate),
  };

  const [items, total] = await Promise.all([
    prisma.pinUsage.findMany({ where, skip, take, include: { pin: true }, orderBy: { usedDate: "desc" } }),
    prisma.pinUsage.count({ where }),
  ]);

  return { items, meta: { page, limit, total } };
};
