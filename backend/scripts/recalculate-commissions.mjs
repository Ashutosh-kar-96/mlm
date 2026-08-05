import prisma from "../src/config/db.js";
import { processOrderBusiness } from "../src/services/mlm.service.js";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  })
);

const dryRun = args.get("dry-run") !== "false";
const orderId = args.get("order-id");
const fromDate = args.get("from");
const toDate = args.get("to");

const where = {
  approvedStatus: 1,
  ...(orderId ? { orderId } : {}),
  ...(fromDate || toDate ? {
    saleDate: {
      ...(fromDate ? { gte: new Date(fromDate) } : {}),
      ...(toDate ? { lte: new Date(toDate) } : {}),
    },
  } : {}),
};

const main = async () => {
  const orders = await prisma.order.findMany({
    where,
    include: { member: true },
    orderBy: { saleDate: "asc" },
  });

  console.log(`Found ${orders.length} approved order(s). dryRun=${dryRun}`);
  if (dryRun) {
    orders.forEach((order) => console.log(`${order.orderId} ${order.regno} ${order.totalAmount}`));
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const order of orders) {
      await tx.commission.deleteMany({ where: { orderId: order.id } });
      await tx.walletLedger.deleteMany({
        where: {
          referenceId: order.orderId,
          type: "Credit",
          OR: [
            { description: { startsWith: "Direct Bonus from" } },
            { description: { startsWith: "Direct Differential from" } },
            { description: { startsWith: "Rank Differential from" } },
            { description: { startsWith: "38% Group Incentive from" } },
            { description: { startsWith: "41% Group Incentive from" } },
          ],
        },
      });
      await processOrderBusiness({
        order,
        buyer: order.member,
        baseAmount: order.subTotalAmount || order.totalAmount,
        bv: order.bv || order.totalAmount,
        recordBusiness: false,
      }, tx);
      console.log(`Recalculated ${order.orderId}`);
    }
  }, { timeout: 120000 });
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
