import prisma from "../config/db.js";
import { pagination } from "../utils/query.js";

export const listHelpDesk = async (query) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.regno ? { regno: { contains: query.regno } } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.helpDeskMessage.findMany({
      where,
      skip,
      take,
      include: { member: true, replies: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.helpDeskMessage.count({ where }),
  ]);

  return { items, meta: { page, limit, total } };
};

export const createHelpDesk = (data) => {
  if (!data.regno || !data.message) {
    const error = new Error("Member and message are required");
    error.status = 400;
    throw error;
  }
  return prisma.helpDeskMessage.create({
    data: {
      regno: data.regno,
      subject: data.subject,
      message: data.message,
    },
  });
};

export const replyHelpDesk = (messageId, adminId, { reply, close = false }) => {
  if (!reply) {
    const error = new Error("Reply message is required");
    error.status = 400;
    throw error;
  }
  return prisma.$transaction(async (tx) => {
    const item = await tx.helpDeskReply.create({
      data: { messageId: Number(messageId), adminId: adminId ? Number(adminId) : undefined, reply },
    });
    if (close) {
      await tx.helpDeskMessage.update({ where: { id: Number(messageId) }, data: { status: "Closed" } });
    }
    return item;
  });
};

export const deleteHelpDesk = (id) =>
  prisma.$transaction(async (tx) => {
    await tx.helpDeskReply.deleteMany({ where: { messageId: Number(id) } });
    return tx.helpDeskMessage.delete({ where: { id: Number(id) } });
  });

export const listDashboardMessages = () =>
  prisma.dashboardMessage.findMany({ orderBy: { createdAt: "desc" } });

export const createDashboardMessage = (adminId, { message, active = true }) => {
  if (!message) {
    const error = new Error("Dashboard message is required");
    error.status = 400;
    throw error;
  }
  return prisma.dashboardMessage.create({
    data: { adminId: adminId ? Number(adminId) : undefined, message, active },
  });
};

export const setDashboardMessageStatus = (id, active) =>
  prisma.dashboardMessage.update({ where: { id: Number(id) }, data: { active } });
