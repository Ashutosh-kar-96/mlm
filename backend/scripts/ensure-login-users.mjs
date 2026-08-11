import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureAdmin() {
  const password = await bcrypt.hash("suraj@@@", 10);
  const existing = await prisma.admin.findFirst({ where: { username: "Admin" } });

  if (existing) {
    return prisma.admin.update({
      where: { id: existing.id },
      data: { password, updatedAt: new Date() },
    });
  }

  return prisma.admin.create({
    data: {
      username: "Admin",
      password,
    },
  });
}

async function ensureMember() {
  const password = await bcrypt.hash("123456", 10);
  const existing = await prisma.member.findFirst({
    where: {
      OR: [
        { emailId: "test@example.com" },
        { username: "test@example.com" },
        { username: "testuser" },
        { regno: "AF10020001" },
      ],
    },
  });
  const rank = await prisma.rank.findFirst({ where: { rankName: "Free Signup" } });

  const data = {
    username: "test@example.com",
    firstName: "Test",
    lastName: "User",
    password,
    sponsorId: null,
    rankId: rank?.id,
    mobileNo: "9876543210",
    emailId: "test@example.com",
    planAmount: 0,
    status: 1,
    loginFlag: true,
    doj: new Date(),
    paidDate: new Date(),
  };

  if (existing) {
    return prisma.member.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.member.create({
    data: {
      regno: "AF10020001",
      ...data,
    },
  });
}

async function main() {
  const admin = await ensureAdmin();
  const member = await ensureMember();

  console.log(`Admin ready: ${admin.username} / suraj@@@`);
  console.log(`Member ready: ${member.emailId} / 123456 (${member.regno})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
