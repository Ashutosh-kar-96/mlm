import app from "../src/app.js";
import prisma from "../src/config/db.js";

const port = Number(process.env.DELIVERY_SMOKE_PORT || 45731);
const base = `http://localhost:${port}/api`;

const request = async (path, { method = "GET", token, body } = {}) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
};

const expect = (name, condition) => {
  if (!condition) throw new Error(name);
  console.log(`ok ${name}`);
};

const server = app.listen(port);
const cycleKey = "2099-12-20";
const regnos = Array.from({ length: 7 }, (_, index) => `DGPG38${index + 1}`);

try {
  const adminLogin = await request("/admin/auth/login", {
    method: "POST",
    body: { username: "Admin", password: "suraj@@@" },
  });
  expect("admin login", adminLogin.status === 200);
  const adminToken = adminLogin.payload.data.accessToken;

  const rank38 = await prisma.rank.findFirst({ where: { percentage: 38 } });

  for (let index = 0; index < regnos.length; index += 1) {
    await prisma.member.create({
      data: {
        regno: regnos[index],
        firstName: `Delivery${index + 1}`,
        rankId: rank38.id,
        status: 1,
        planAmount: 0,
      },
    });
    await prisma.gpgSubscription.create({
      data: {
        regno: regnos[index],
        rankLabel: 38,
        cycleKey,
        subscribedAt: new Date(2099, 11, 20, 9, index, 0),
        approvalStatus: "Pending",
      },
    });
  }

  const listed = await request(`/ranks/gpg-subscriptions?cycleKey=${cycleKey}&rank=38&limit=10`, { token: adminToken });
  expect("gpg list endpoint", listed.status === 200);
  expect("gpg list includes cycle range", Boolean(listed.payload.data.cycle?.start && listed.payload.data.cycle?.end));
  expect("gpg list sorted by subscription time", listed.payload.data.items[0].regno === "DGPG381");

  const auto = await request("/ranks/gpg-subscriptions/auto-assign", {
    method: "POST",
    token: adminToken,
    body: { rank: 38, cycleKey },
  });
  expect("gpg auto assign endpoint", auto.status === 200);
  expect("gpg auto assigns five", auto.payload.data.assigned.length === 5);

  const after = await prisma.gpgSubscription.findMany({
    where: { cycleKey, rankLabel: 38 },
    orderBy: { subscribedAt: "asc" },
  });
  expect("gpg percentages persisted", JSON.stringify(after.map((item) => Number(item.accessPercentage || 0))) === JSON.stringify([7, 4.5, 3, 2, 1, 0, 0]));
  expect("gpg auto mode persisted", after.slice(0, 5).every((item) => item.assignmentMode === "AUTO"));
} finally {
  await prisma.gpgSubscription.deleteMany({ where: { regno: { in: regnos } } });
  await prisma.member.deleteMany({ where: { regno: { in: regnos } } });
  await prisma.$disconnect();
  await new Promise((resolve) => server.close(resolve));
}
