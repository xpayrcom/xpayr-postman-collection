import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const collection = JSON.parse(await readFile(
  new URL("../postman/xpayr_testnet_smoke.postman_collection.json", import.meta.url),
  "utf8",
));
const baseUrl = String(process.env.XPAYR_BASE_URL || "https://xpayr.com/api/v1").replace(/\/+$/, "");
const bearerToken = String(process.env.XPAYR_TEST_SECRET_KEY || "");
const outputPath = String(process.env.XPAYR_SMOKE_OUTPUT || "artifacts/testnet-smoke.json");
assert.match(baseUrl, /^https:\/\//, "XPAYR_BASE_URL must use HTTPS");
assert.match(bearerToken, /^sk_test_[A-Za-z0-9_-]{32,}$/, "XPAYR_TEST_SECRET_KEY must be a test key");

const allowed = new Map([
  ["Health", { method: "GET", path: "/health", status: 200 }],
  ["Arc Testnet network catalog", { method: "GET", path: "/me/networks", status: 200 }],
  ["Create Arc Testnet USDC session", { method: "POST", path: "/payments", status: 201 }],
  ["Read created session", { method: "GET", path: "/payments/{{payment_id}}", status: 200 }],
]);
assert.equal(collection.item?.length, allowed.size, "Smoke collection must contain exactly the allowlisted requests");

const variables = {
  base_url: baseUrl,
  bearer_token: bearerToken,
  payment_id: "",
  payment_url: "",
};
const render = (value) => String(value)
  .replace(/\{\{\$timestamp\}\}/g, String(Math.floor(Date.now() / 1000)))
  .replace(/\{\{([a-z_]+)\}\}/gi, (_, key) => variables[key] ?? "");

for (const item of collection.item) {
  const rule = allowed.get(item.name);
  assert.ok(rule, `Unexpected smoke request: ${item.name}`);
  assert.equal(item.request?.method, rule.method);
  const rawUrl = item.request?.url?.raw;
  assert.equal(rawUrl, `{{base_url}}${rule.path}`);
  const authenticated = item.request?.auth?.type === "bearer";
  const headers = {
    Accept: "application/json",
    "User-Agent": "XPayr-Postman-Collection-Smoke/1.0",
    ...(authenticated ? { Authorization: `Bearer ${bearerToken}` } : {}),
  };
  let body;
  if (item.request?.body?.mode === "raw") {
    headers["Content-Type"] = "application/json";
    body = render(item.request.body.raw);
  }
  const response = await fetch(render(rawUrl), {
    method: rule.method,
    headers,
    body,
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${item.name} returned invalid JSON (${response.status})`);
  }
  assert.equal(response.status, rule.status, `${item.name} failed: ${payload?.error?.code || "unknown"}`);

  if (item.name === "Arc Testnet network catalog") {
    assert.equal(payload?.livemode, false);
    const arc = payload?.data?.find((network) => network.network_key === "arc-testnet");
    assert.equal(arc?.chain_id, 5042002);
    assert.ok(arc?.currencies?.some((currency) => currency.symbol === "USDC"));
  } else if (item.name === "Create Arc Testnet USDC session") {
    assert.match(payload?.id || "", /^ps_[a-z0-9]+$/);
    assert.equal(payload.network, "arc-testnet");
    assert.equal(payload.currency, "USDC");
    assert.equal(payload.status, "pending");
    assert.equal(payload.livemode, false);
    assert.match(payload.payment_url || "", /^https:\/\/xpayr\.com\/(?:pay|test|test-pay)\/ps_[a-z0-9]+$/);
    variables.payment_id = payload.id;
    variables.payment_url = payload.payment_url;
  } else if (item.name === "Read created session") {
    assert.equal(payload?.id, variables.payment_id);
    assert.equal(payload?.status, "pending");
  }
}

const evidence = {
  ok: true,
  checked_at: new Date().toISOString(),
  collection: collection.info.name,
  requests: collection.item.length,
  session_id: variables.payment_id,
  payment_url: variables.payment_url,
  live_funds_moved: false,
};
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify(evidence));
