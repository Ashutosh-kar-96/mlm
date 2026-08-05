import prisma from "../config/db.js";
import { dateRange, pagination } from "../utils/query.js";

export const downlineBusiness = async (query) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.q ? {
      OR: [
        { regno: { contains: query.q } },
        { downlineRegno: { contains: query.q } },
        { downline: { is: { firstName: { contains: query.q } } } },
        { downline: { is: { lastName: { contains: query.q } } } },
      ],
    } : {}),
    ...(query.regno ? { regno: { contains: query.regno } } : {}),
    ...(query.downlineRegno ? { downlineRegno: { contains: query.downlineRegno } } : {}),
    ...dateRange("fromDate", query.fromDate, query.toDate),
  };

  const [items, total, business] = await Promise.all([
    prisma.downlineBusiness.findMany({
      where,
      skip,
      take,
      include: { owner: true, downline: true },
      orderBy: { id: "desc" },
    }),
    prisma.downlineBusiness.count({ where }),
    prisma.downlineBusiness.aggregate({ where, _sum: { businessAmount: true } }),
  ]);

  return { items, totals: { businessAmount: business._sum.businessAmount || 0 }, meta: { page, limit, total } };
};

export const onlineTransactions = async (query) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.q ? {
      OR: [
        { regno: { contains: query.q } },
        { name: { contains: query.q } },
        { mobile: { contains: query.q } },
        { amountTxnId: { contains: query.q } },
      ],
    } : {}),
    ...(query.regno ? { regno: { contains: query.regno } } : {}),
    ...dateRange("txnDate", query.fromDate, query.toDate),
  };

  const [items, total, amount] = await Promise.all([
    prisma.onlineTransaction.findMany({ where, skip, take, orderBy: { txnDate: "desc" } }),
    prisma.onlineTransaction.count({ where }),
    prisma.onlineTransaction.aggregate({ where, _sum: { transactionAmount: true } }),
  ]);

  return { items, totals: { transactionAmount: amount._sum.transactionAmount || 0 }, meta: { page, limit, total } };
};

export const orders = async (query) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.q ? {
      OR: [
        { regno: { contains: query.q } },
        { name: { contains: query.q } },
        { orderId: { contains: query.q } },
      ],
    } : {}),
    ...(query.regno ? { regno: { contains: query.regno } } : {}),
    ...(query.orderId ? { orderId: { contains: query.orderId } } : {}),
    ...dateRange("saleDate", query.fromDate, query.toDate),
  };

  const [items, total, amount] = await Promise.all([
    prisma.order.findMany({ where, skip, take, include: { items: true, shop: true }, orderBy: { saleDate: "desc" } }),
    prisma.order.count({ where }),
    prisma.order.aggregate({ where, _sum: { totalAmount: true, bv: true, pv: true } }),
  ]);

  return { items, totals: amount._sum, meta: { page, limit, total } };
};

export const poolMembers = (rankName, query) =>
  prisma.member.findMany({
    where: {
      ...(query.regno ? { regno: { contains: query.regno } } : {}),
      rank: { rankName: { contains: rankName } },
      ...dateRange("paidDate", query.fromDate, query.toDate),
    },
    include: { rank: true },
    orderBy: { paidDate: "desc" },
  });
