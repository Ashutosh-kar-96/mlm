import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
const apiBase = process.env.API_URL || "http://localhost:5000/api";
const browserPath = process.env.BROWSER_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const debugPort = Number(process.env.CDP_PORT || 47321);

const publicRoutes = ["/login", "/register"];
const userRoutes = [
  "/dashboard",
  "/dashboard/register-member",
  "/dashboard/profile/edit",
  "/dashboard/profile/welcome-letter",
  "/dashboard/profile/id-card",
  "/dashboard/profile/change-password",
  "/dashboard/kyc",
  "/dashboard/kyc/bank",
  "/dashboard/kyc/pan",
  "/dashboard/kyc/aadhaar",
  "/dashboard/network",
  "/dashboard/business/direct",
  "/dashboard/business/level-tree",
  "/dashboard/business/downline",
  "/dashboard/business/mlm-status",
  "/dashboard/license/activation",
  "/dashboard/license/used",
  "/dashboard/wallet",
  "/dashboard/withdrawals",
  "/dashboard/payout/statement",
  "/dashboard/payout/income-detail",
  "/dashboard/support/help-desk",
  "/dashboard/support/contact-us",
  "/dashboard/orders/add-fund",
  "/dashboard/orders/transactions",
  "/dashboard/orders/wallet",
  "/dashboard/orders/payment",
  "/dashboard/orders/my-orders",
  "/dashboard/continue-shopping",
];
const adminRoutes = [
  "/admin",
  "/admin/members",
  "/admin/member-account/AF10020001",
  "/admin/pan-card/unverified",
  "/admin/pan-card/verified",
  "/admin/company-business/current",
  "/admin/company-business/downline",
  "/admin/members/active",
  "/admin/members/unpaid",
  "/admin/members/blocked",
  "/admin/members/tds-report",
  "/admin/members/online-transaction-report",
  "/admin/withdrawals",
  "/admin/payout/distribute",
  "/admin/payout/distributed",
  "/admin/payout/income-detail",
  "/admin/kyc",
  "/admin/change-password",
  "/admin/pins/generate-new",
  "/admin/pins/activated",
  "/admin/pins/transfer",
  "/admin/pins/used",
  "/admin/pins/transaction-report",
  "/admin/pins/generation-report",
  "/admin/rank-setting/set-rank",
  "/admin/rank-setting/report",
  "/admin/rank-setting/plan",
  "/admin/rank-setting/rewards",
  "/admin/rank-setting/gpg",
  "/admin/rank-setting/licenses",
  "/admin/rank-setting/challenges",
  "/admin/utility-desk/member-help-desk",
  "/admin/utility-desk/message-to-dashboard",
  "/admin/products",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const login = async (path, body) => {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(`Login failed for ${path}: ${payload.message || response.status}`);
  }
  return payload.data;
};

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result || {});
        return;
      }
      this.events.push(message);
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 10000);
    });
  }

  takeErrors() {
    const errors = this.events.filter((event) =>
      event.method === "Runtime.exceptionThrown"
      || (event.method === "Log.entryAdded" && event.params?.entry?.level === "error")
      || (event.method === "Runtime.consoleAPICalled" && ["error", "assert"].includes(event.params?.type))
    );
    this.events = [];
    return errors.map((event) => {
      if (event.method === "Runtime.exceptionThrown") return event.params?.exceptionDetails?.text || "Runtime exception";
      if (event.method === "Runtime.consoleAPICalled") return event.params?.args?.map((arg) => arg.value || arg.description).join(" ") || "Console error";
      return event.params?.entry?.text || "Log error";
    });
  }
}

const createTab = async () => {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(`${frontendBase}/login`)}`, { method: "PUT" });
  const target = await response.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  const cdp = new Cdp(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  return cdp;
};

const waitForBrowser = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error("Browser did not expose DevTools endpoint");
};

const evaluate = (cdp, expression) =>
  cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }).then((result) => result.result?.value);

const setSession = async (cdp, session) => {
  await cdp.send("Page.navigate", { url: `${frontendBase}/login` });
  await sleep(700);
  await evaluate(cdp, `localStorage.setItem('rahuovelia.auth', ${JSON.stringify(JSON.stringify(session))})`);
};

const checkRoute = async (cdp, route) => {
  await cdp.send("Page.navigate", { url: `${frontendBase}${route}` });
  await sleep(1200);
  const errors = cdp.takeErrors();
  const state = await evaluate(cdp, `(() => ({
    path: location.pathname,
    title: document.title,
    textLength: document.body.innerText.trim().length,
    text: document.body.innerText.slice(0, 700),
    rootChildren: document.querySelector('#root')?.children.length || 0
  }))()`);
  const failed = [];
  if (state.rootChildren < 1 || state.textLength < 20) failed.push("blank page");
  if (errors.length) failed.push(`console/runtime errors: ${errors.join(" | ")}`);
  if (/Something went wrong|Cannot read properties|ReferenceError|TypeError|Unhandled Runtime Error/i.test(state.text)) {
    failed.push("error-like text rendered");
  }
  return { route, finalPath: state.path, title: state.title, ok: failed.length === 0, failed, sample: state.text.split(/\n/).slice(0, 3).join(" | ") };
};

const normalizeUser = (data, role) => {
  if (role === "admin") {
    return {
      role,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: { id: `ADM${data.admin?.id || 1}`, name: data.admin?.username || "Admin", email: "", role },
    };
  }
  const user = data.user || {};
  return {
    role,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: {
      id: user.regno || user.id,
      name: user.name || [user.firstName, user.lastName].filter(Boolean).join(" "),
      email: user.email || user.emailId || "",
      sponsor: user.sponsorId || "",
      rank: user.rank || "Member",
      kyc: user.kyc || "Pending",
      joined: user.joined || user.doj || "",
      status: user.status,
      role,
    },
  };
};

const runGroup = async (label, routes, session) => {
  const cdp = await createTab();
  if (session) await setSession(cdp, session);
  const results = [];
  for (const route of routes) {
    const result = await checkRoute(cdp, route);
    results.push({ group: label, ...result });
    console.log(`${result.ok ? "ok" : "FAIL"} ${label} ${route}${result.ok ? "" : ` :: ${result.failed.join("; ")}`}`);
  }
  return results;
};

const main = async () => {
  const userLogin = await login("/users/auth/login", { identifier: "testuser", password: "123456" });
  const adminLogin = await login("/admin/auth/login", { username: "Admin", password: "suraj@@@" });
  const userSession = normalizeUser(userLogin, "user");
  const adminSession = normalizeUser(adminLogin, "admin");

  const userDataDir = await mkdtemp(join(tmpdir(), "mlm-screen-smoke-"));
  const browser = spawn(browserPath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ], { stdio: "ignore" });

  try {
    await waitForBrowser();
    const results = [
      ...await runGroup("public", publicRoutes, null),
      ...await runGroup("user", userRoutes, userSession),
      ...await runGroup("admin", adminRoutes, adminSession),
    ];
    const failed = results.filter((result) => !result.ok);
    console.log(JSON.stringify({
      total: results.length,
      passed: results.length - failed.length,
      failed: failed.map(({ group, route, finalPath, failed }) => ({ group, route, finalPath, failed })),
    }, null, 2));
    if (failed.length) process.exitCode = 1;
  } finally {
    browser.kill();
    await sleep(500);
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
