import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getCache } from "@vercel/functions";
import { pollCodexDeviceLogin, reasoningProviderOptions, runCodexChat, startCodexDeviceLogin } from "../lib/codex.js";

const cache = getCache({ namespace: "family-gpt-codex-v1" });
const realFetch = globalThis.fetch;
afterEach(async () => { globalThis.fetch = realFetch; await cache.delete("session"); });

test("reasoning effort uses the @ai-sdk/openai providerOptions shape", () => {
  assert.deepEqual(reasoningProviderOptions({ id: "gpt-5.6-terra", reasoning: "medium" }), { openai: { reasoningEffort: "medium" } });
});

test("runCodexChat sends reasoning.effort in the Responses request body", async () => {
  await cache.set("session", { accessToken: "test-access", refreshToken: "test-refresh", accountId: "acct_test", expiresAt: Date.now() + 3_600_000 });
  const bodies = [];
  globalThis.fetch = async (url, init = {}) => {
    if (typeof init.body === "string") { try { bodies.push(JSON.parse(init.body)); } catch {} }
    return new Response(JSON.stringify({ error: { message: "stubbed", type: "invalid_request_error" } }), { status: 400, headers: { "content-type": "application/json" } });
  };
  await assert.rejects(runCodexChat({ messages: [{ role: "user", content: "hello" }], model: "terra" }));
  const sent = bodies.find((body) => body?.model === "gpt-5.6-terra");
  assert.ok(sent, "expected a Responses request for the routed model");
  assert.equal(sent.reasoning?.effort, "medium");
});

function fakeJwt(claims) {
  return `e30.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.sig`;
}

function stubDeviceAuth() {
  const calls = { exchange: 0, refresh: 0 };
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
    if (href.endsWith("/deviceauth/usercode")) return json({ device_auth_id: "dev_1", user_code: "ABCD-1234", interval: "5" });
    if (href.endsWith("/deviceauth/token")) return json({ authorization_code: "code_1", code_verifier: "verifier_1" });
    if (href.endsWith("/oauth/token")) {
      if (String(init.body).includes("grant_type=authorization_code")) {
        calls.exchange += 1;
        if (calls.exchange > 1) return json({ error_description: "code already used" }, 400);
      } else calls.refresh += 1;
      return json({ access_token: fakeJwt({ chatgpt_account_id: "acct_1" }), refresh_token: "refresh_1", expires_in: 3600 });
    }
    throw new Error(`unexpected fetch ${href}`);
  };
  return calls;
}

test("concurrent device-login polls exchange the authorization code only once", async () => {
  const calls = stubDeviceAuth();
  const started = await startCodexDeviceLogin();
  assert.equal(started.status, "pending");
  const results = await Promise.all([pollCodexDeviceLogin(started.pairingId), pollCodexDeviceLogin(started.pairingId)]);
  assert.equal(calls.exchange, 1);
  assert.deepEqual(results.map((r) => r.status).sort(), ["connected", "pending"]);
  // The follow-up poll sees the finished pairing as connected instead of re-exchanging or 410.
  assert.equal((await pollCodexDeviceLogin(started.pairingId)).status, "connected");
  assert.equal(calls.exchange, 1);
});
