import prisma from "../config/db.js";

export const create = (regno, data) =>
  prisma.fileUpload.create({
    data: {
      regno,
      type: data.type,
      fileName: data.fileName,
      fileUrl: data.fileUrl || data.url || `/uploads/${data.type}/${data.fileName || "document"}`,
      status: data.status || "Pending",
    },
  });

export const list = (regno, query = {}) =>
  prisma.fileUpload.findMany({
    where: {
      regno,
      ...(query.type ? { type: query.type } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
