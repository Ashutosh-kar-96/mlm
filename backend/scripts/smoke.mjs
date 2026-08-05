import app from "../src/app.js";
import prisma from "../src/config/db.js";
import { updateRanksForMembers } from "../src/services/mlm.service.js";

const port = Number(process.env.SMOKE_PORT || 5055);
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

const expectStatus = (name, actual, expected) => {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`);
  }
  console.log(`ok ${name} (${actual})`);
};

const expect = (name, condition) => {
  if (!condition) throw new Error(name);
  console.log(`ok ${name}`);
};

const testRankLogic = async () => {
  const rollback = new Error("rollback rank logic smoke data");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.member.create({
        data: {
          regno: "SMOKERANK01",
          firstName: "Smoke",
          lastName: "Rank",
          rankId: 2,
          planAmount: 0,
          status: 1,
        },
      });

      await tx.order.create({
        data: {
          orderId: "SMOKERANKORDER01",
          regno: "SMOKERANK01",
          name: "Smoke Rank",
          pv: 225,
          bv: 22500,
          totalAmount: 22500,
          saleDate: new Date(),
          approvedStatus: 1,
        },
      });

      for (let index = 1; index <= 4; index += 1) {
        await tx.member.create({
          data: {
            regno: `SMOKERANK1${index}`,
            firstName: `Leg${index}`,
            sponsorId: "SMOKERANK01",
            rankId: 1,
            planAmount: 0,
            status: 1,
          },
        });
      }

      await updateRanksForMembers(["SMOKERANK01"], undefined, tx);
      const upgraded = await tx.member.findUnique({ where: { regno: "SMOKERANK01" }, include: { rank: true } });
      expect("rank logic 14% x 4 upgrades to 24%", upgraded?.rank?.percentage?.toString() === "24");
      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  }
};

const server = app.listen(port);

try {
  const memberLogin = await request("/users/auth/login", {
    method: "POST",
    body: { identifier: "testuser", password: "123456" },
  });
  expectStatus("member login", memberLogin.status, 200);
  const memberToken = memberLogin.payload.data.accessToken;
  const memberRegno = memberLogin.payload.data.user.regno;

  const adminLogin = await request("/admin/auth/login", {
    method: "POST",
    body: { username: "Admin", password: "suraj@@@" },
  });
  expectStatus("admin login", adminLogin.status, 200);
  const adminToken = adminLogin.payload.data.accessToken;

  expectStatus("member dashboard", (await request("/users/me/dashboard", { token: memberToken })).status, 200);
  expectStatus("member wallet", (await request("/users/me/wallet", { token: memberToken })).status, 200);
  expectStatus("member network", (await request("/users/me/network", { token: memberToken })).status, 200);
  expectStatus("member own downline", (await request(`/members/${memberRegno}/downline`, { token: memberToken })).status, 200);
  expectStatus("member list forbidden", (await request("/members/member?limit=1", { token: memberToken })).status, 403);
  expectStatus("reports forbidden to member", (await request("/reports/orders?limit=1", { token: memberToken })).status, 403);
  expectStatus("support dashboard messages forbidden to member", (await request("/support/dashboard-messages", { token: memberToken })).status, 403);
  expectStatus("member password validation", (await request("/users/me/password", {
    method: "PATCH",
    token: memberToken,
    body: { oldPassword: "wrong", newPassword: "1234567" },
  })).status, 400);

  expectStatus("admin dashboard", (await request("/admin/dashboard", { token: adminToken })).status, 200);
  expectStatus("admin members", (await request("/members/member?limit=1", { token: adminToken })).status, 200);
  expectStatus("admin reports", (await request("/reports/orders?limit=1", { token: adminToken })).status, 200);
  expectStatus("admin pins", (await request("/pins/pin?limit=1", { token: adminToken })).status, 200);
  expectStatus("admin rank plan", (await request("/ranks/plan", { token: adminToken })).status, 200);
  expectStatus("admin reward report", (await request("/ranks/rewards?limit=1", { token: adminToken })).status, 200);
  expectStatus("admin income report", (await request("/ranks/commissions?limit=1", { token: adminToken })).status, 200);
  const rewardReport = await request("/ranks/rewards?regno=AF10020001&limit=1", { token: adminToken });
  const rewardClaim = rewardReport.payload.data.items?.[0]?.rewards?.find((reward) => reward.claim)?.claim;
  if (rewardClaim?.id) {
    expectStatus("admin reward status update", (await request(`/ranks/rewards/${rewardClaim.id}`, {
      method: "PATCH",
      token: adminToken,
      body: { status: rewardClaim.status || "Pending" },
    })).status, 200);
  }
  const ranks = await request("/members/ranks", { token: adminToken });
  expectStatus("rank list", ranks.status, 200);
  expect("rank list uses client percentages", ranks.payload.data.some((rank) => Number(rank.percentage) === 42));

  const foreignTransfer = await prisma.pinTransfer.findFirst({
    where: { toRegno: { not: memberRegno }, pin: { usedStatus: false, activeStatus: true } },
    include: { pin: true },
  });
  if (foreignTransfer?.pin?.pinNo) {
    expectStatus("foreign pin forbidden", (await request("/pins/use", {
      method: "POST",
      token: memberToken,
      body: { pinNo: foreignTransfer.pin.pinNo, usedForRegno: memberRegno },
    })).status, 403);
  }

  await testRankLogic();
} finally {
  await prisma.$disconnect();
  await new Promise((resolve) => server.close(resolve));
}
