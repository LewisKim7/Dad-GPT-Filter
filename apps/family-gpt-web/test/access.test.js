import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { FAMILY_CODE_ENV, FAMILY_CODE_HEADER, checkFamilyAccess, resetAccessFailuresForTests, safeEqualHex, sha256Hex } from "../lib/access.js";

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
