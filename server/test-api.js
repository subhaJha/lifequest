/**
 * Simple API test runner for the LifeQuest backend.
 * Run: node test-api.js
 *
 * Notes:
 * - Requires the server to already be running on http://localhost:5000
 * - Uses fetch (Node 18+). If your Node version is older, this script will fail.
 */
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

async function request(method, path, { token, body } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

async function main() {
  console.log(`Base URL: ${BASE_URL}`);

  // 1) Unauthorized checks
  console.log("\n[1] Unauthorized: GET /api/tasks/");
  const unauthTasks = await request("GET", "/api/tasks/");
  console.log("Status:", unauthTasks.status, "Body:", unauthTasks.data);
  assert(unauthTasks.status === 401, "Expected 401 for unauthorized /api/tasks/");

  // 2) Register
  console.log("\n[2] Register: POST /api/auth/register");
  const email = `apitest_${Date.now()}@example.com`;
  const username = `apiuser_${Date.now()}`;
  const password = "Password123";

  const reg = await request("POST", "/api/auth/register", {
    body: { username, email, password },
  });
  console.log("Status:", reg.status);
  assert(reg.status === 201, "Expected 201 on register");
  assert(!!reg.data?.token, "Expected token on register response");

  const token = reg.data.token;
  const user = reg.data.user;
  console.log("Registered user id:", user?._id);

  // 3) Authorized login check (happy path)
  console.log("\n[3] Login: POST /api/auth/login");
  const login = await request("POST", "/api/auth/login", {
    body: { email, password },
  });
  console.log("Status:", login.status);
  assert(login.status === 200, "Expected 200 on login");
  assert(!!login.data?.token, "Expected token on login response");

  // Use login token (same secret) for rest
  const authToken = login.data.token;

  // 4) User me (if exists in your routes)
  console.log("\n[4] User profile check: GET /api/user/me");
  try {
    const me = await request("GET", "/api/user/me", { token: authToken });
    console.log("Status:", me.status, "Body:", me.data);
  } catch (e) {
    console.log("Skipping /api/user/me check due to request error:", e?.message);
  }

  // 5) Create task (validation error)
  console.log("\n[5] Validation: POST /api/tasks/ missing title/xpReward");
  const badCreate = await request("POST", "/api/tasks/", {
    token: authToken,
    body: { description: "d", category: "c" },
  });
  console.log("Status:", badCreate.status, "Body:", badCreate.data);
  assert(badCreate.status === 400, "Expected 400 for missing title/xpReward");

  // 6) Create task (happy path)
  console.log("\n[6] Create task: POST /api/tasks/");
  const createBody = {
    title: "Test task",
    description: "This is a test task",
    category: "coding",
    xpReward: 10,
    priority: "high",
  };
  const created = await request("POST", "/api/tasks/", {
    token: authToken,
    body: createBody,
  });
  console.log("Status:", created.status, "Body:", created.data);
  assert(created.status === 201, "Expected 201 for created task");
  assert(created.data?._id, "Expected created task to have _id");

  const taskId = created.data._id;

  // 7) List tasks
  console.log("\n[7] List tasks: GET /api/tasks/");
  const list1 = await request("GET", "/api/tasks/", { token: authToken });
  console.log("Status:", list1.status, "Count:", Array.isArray(list1.data) ? list1.data.length : "n/a");
  assert(list1.status === 200, "Expected 200 for list tasks");

  // 8) Complete task
  console.log("\n[8] Complete task: PUT /api/tasks/:taskId/complete");
  const complete1 = await request("PUT", `/api/tasks/${taskId}/complete`, { token: authToken });
  console.log("Status:", complete1.status, "Body:", complete1.data?.task ? { task: complete1.data.task, xpResult: complete1.data.xpResult } : complete1.data);
  assert(complete1.status === 200, "Expected 200 for complete task");

  // 9) Complete again (edge)
  console.log("\n[9] Complete again (edge): PUT /api/tasks/:taskId/complete");
  const complete2 = await request("PUT", `/api/tasks/${taskId}/complete`, { token: authToken });
  console.log("Status:", complete2.status, "Body:", complete2.data);
  assert(complete2.status === 400, "Expected 400 for already completed task");

  // 10) Delete task
  console.log("\n[10] Delete task: DELETE /api/tasks/:taskId");
  const del1 = await request("DELETE", `/api/tasks/${taskId}`, { token: authToken });
  console.log("Status:", del1.status, "Body:", del1.data);
  assert(del1.status === 200, "Expected 200 for delete task");

  // 11) Delete again (edge: 404)
  console.log("\n[11] Delete again (edge): DELETE /api/tasks/:taskId");
  const del2 = await request("DELETE", `/api/tasks/${taskId}`, { token: authToken });
  console.log("Status:", del2.status, "Body:", del2.data);
  assert(del2.status === 404, "Expected 404 for deleting non-existent task");

  console.log("\n✅ All API tests passed.");
}

main().catch((err) => {
  console.error("\n❌ API tests failed:", err?.stack || err?.message || err);
  process.exit(1);
});
