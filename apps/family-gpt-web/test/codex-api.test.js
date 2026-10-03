import assert from "node:assert/strict";
import { test } from "node:test";
import handler from "../api/codex.js";
import { FAMILY_CODE_ENV, FAMILY_CODE_HEADER, sha256Hex } from "../lib/access.js";

const CODE = "family-test-code";
process.env[FAMILY_CODE_ENV] = sha256Hex(CODE);

function call(body, ip) {
  const req = { method: "POST", headers: { "x-forwarded-for": ip, [FAMILY_CODE_HEADER]: CODE }, body };
  const res = {
    statusCode: 200, body: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
  return handler(req, res).then(() => res);
}

test("invalid Codex messages are rejected with 400 before touching quota or session", async () => {
  assert.equal((await call({}, "198.51.100.1")).statusCode, 400);
  assert.equal((await call({ messages: "hi" }, "198.51.100.2")).statusCode, 400);
  assert.equal((await call({ messages: [{ role: "user", content: "q" }, { role: "assistant", content: "a" }] }, "198.51.100.3")).statusCode, 400);
});

test("disconnected Codex session returns 503", async () => {
  const res = await call({ messages: [{ role: "user", content: "hello" }] }, "198.51.100.4");
  assert.equal(res.statusCode, 503);
});
