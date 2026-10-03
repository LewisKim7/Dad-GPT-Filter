import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getCache } from "@vercel/functions";
import { reasoningProviderOptions, runCodexChat } from "../lib/codex.js";

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
