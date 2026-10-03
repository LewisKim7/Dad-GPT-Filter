import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { FAMILY_CODE_ENV, FAMILY_CODE_HEADER, checkFamilyAccess, createWindowCounter, resetAccessFailuresForTests, safeEqualHex, sha256Hex } from "../lib/access.js";

const CODE = "family-test-code";
const env = { [FAMILY_CODE_ENV]: sha256Hex(CODE) };
const req = (code, ip = "203.0.113.1") => ({ headers: { "x-forwarded-for": ip, ...(code === undefined ? {} : { [FAMILY_CODE_HEADER]: code }) } });

beforeEach(() => resetAccessFailuresForTests());

test("missing env var fails closed with 503", () => {
  assert.equal(checkFamilyAccess(req(CODE), {}).status, 503);
  assert.equal(checkFamilyAccess(req(CODE), { [FAMILY_CODE_ENV]: "not-a-hash" }).status, 503);
});

test("correct code is accepted, including uppercase env hex and URI-encoded header", () => {
  assert.deepEqual(checkFamilyAccess(req(CODE), env), { ok: true });
  assert.deepEqual(checkFamilyAccess(req(CODE), { [FAMILY_CODE_ENV]: sha256Hex(CODE).toUpperCase() }), { ok: true });
  const unicode = "가족 1234";
  assert.deepEqual(checkFamilyAccess(req(encodeURIComponent(unicode)), { [FAMILY_CODE_ENV]: sha256Hex(unicode) }), { ok: true });
});

test("missing or wrong code returns 401", () => {
  const missing = checkFamilyAccess(req(undefined), env);
  assert.equal(missing.status, 401);
  assert.ok(missing.error);
  assert.equal(checkFamilyAccess(req("wrong"), env).status, 401);
  assert.equal(checkFamilyAccess(req("%E0%A4%A"), env).status, 401);
});

test("repeated failures from one client are throttled", () => {
  for (let i = 0; i < 20; i += 1) assert.equal(checkFamilyAccess(req("wrong"), env).status, 401);
  assert.equal(checkFamilyAccess(req(CODE), env).status, 429);
  assert.deepEqual(checkFamilyAccess(req(CODE, "203.0.113.2"), env), { ok: true });
});

test("safeEqualHex handles length mismatch", () => {
  assert.equal(safeEqualHex("ab", "abc"), false);
  assert.equal(safeEqualHex("abc", "abc"), true);
});

test("window counter counts per key and resets after the window", () => {
  const counter = createWindowCounter({ windowMs: 1000 });
  assert.equal(counter.increment("a", 0), 1);
  assert.equal(counter.increment("a", 500), 2);
  assert.equal(counter.count("a", 999), 2);
  assert.equal(counter.count("a", 1000), 0);
  assert.equal(counter.increment("a", 1000), 1);
});

test("window counter sweeps expired clients so the map stays bounded", () => {
  const counter = createWindowCounter({ windowMs: 1000, maxEntries: 50 });
  for (let i = 0; i < 40; i += 1) counter.increment(`old-${i}`, 0);
  assert.equal(counter.size, 40);
  counter.increment("new", 1500);
  assert.equal(counter.size, 1);
  for (let i = 0; i < 200; i += 1) counter.increment(`live-${i}`, 1600);
  assert.ok(counter.size <= 50, `size ${counter.size} exceeds cap`);
  assert.equal(counter.count("live-199", 1600), 1);
});

test("access failures expire after the window", () => {
  for (let i = 0; i < 30; i += 1) checkFamilyAccess(req("wrong", `198.18.0.${i}`), env, 0);
  assert.equal(checkFamilyAccess(req("wrong", "198.18.1.1"), env, 11 * 60_000).status, 401);
  for (let i = 0; i < 30; i += 1) assert.equal(checkFamilyAccess(req(CODE, `198.18.0.${i}`), env, 11 * 60_000).ok, true);
});
