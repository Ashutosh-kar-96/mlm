import prisma from "../config/db.js";

export const logAudit = (adminId, action, entityType, entityId, details = {}, client = prisma) =>
  client.auditLog.create({
    data: {
      adminId: adminId ? Number(adminId) : undefined,
      action,
      entityType,
      entityId: entityId ? String(entityId) : undefined,
      detailsJson: JSON.stringify(details),
    },
  });

export const listAudit = (query = {}) =>
  prisma.auditLog.findMany({
    where: {
      ...(query.action ? { action: { contains: query.action } } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
    },
    include: { admin: { select: { id: true, username: true } } },
    orderBy: { createdAt: "desc" },
  });
