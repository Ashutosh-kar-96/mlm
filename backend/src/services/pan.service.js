import prisma from "../config/db.js";
import { dateRange, pagination } from "../utils/query.js";

const normalizePanStatus = (status) => {
  const map = {
    pending: "Pending",
    verified: "Verified",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };
  return map[String(status || "").toLowerCase()] || status;
};

export const listPan = async (query, status) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(status ? { status: normalizePanStatus(status) } : {}),
    member: {
      ...(query.q ? {
        OR: [
          { regno: { contains: query.q } },
          { firstName: { contains: query.q } },
          { lastName: { contains: query.q } },
          { username: { contains: query.q } },
          { mobileNo: { contains: query.q } },
        ],
      } : {}),
      ...(query.regno ? { regno: { contains: query.regno } } : {}),
      ...(query.mobile ? { mobileNo: { contains: query.mobile } } : {}),
      ...dateRange("doj", query.fromDate, query.toDate),
    },
  };

  const [items, total] = await Promise.all([
    prisma.panVerification.findMany({
      where,
      skip,
      take,
      include: { member: { include: { rank: true } } },
      orderBy: { id: "desc" },
    }),
    prisma.panVerification.count({ where }),
  ]);

  return { items, meta: { page, limit, total } };
};

export const updatePanStatus = (id, status, adminUsername) =>
  prisma.panVerification.update({
    where: { id: Number(id) },
    data: {
      status: normalizePanStatus(status),
      verifiedBy: adminUsername,
      verifiedDate: new Date(),
    },
  });
