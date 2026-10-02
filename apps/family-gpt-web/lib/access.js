import crypto from "node:crypto";

export const FAMILY_CODE_HEADER = "x-family-code";
export const FAMILY_CODE_ENV = "FAMILY_ACCESS_CODE_SHA256";

const FAIL_WINDOW_MS = 10 * 60_000;
const MAX_FAILURES = 20;
const failures = new Map();

export function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

export function safeEqualHex(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function clientKey(req) {
  return String(req.headers?.["x-forwarded-for"] || req.headers?.["x-real-ip"] || "unknown").split(",")[0].trim();
}

function readCode(req) {
  const raw = req.headers?.[FAMILY_CODE_HEADER];
  const value = String(Array.isArray(raw) ? raw[0] : raw || "").trim();
  if (!value) return "";
  // Browsers send encodeURIComponent(code) so non-ASCII codes survive HTTP headers.
  try { return decodeURIComponent(value).trim(); } catch { return value; }
}

function tooManyFailures(key, now) {
  const entry = failures.get(key);
  if (!entry || now - entry.startedAt >= FAIL_WINDOW_MS) return false;
  return entry.count >= MAX_FAILURES;
}

function recordFailure(key, now) {
  const entry = failures.get(key);
  if (!entry || now - entry.startedAt >= FAIL_WINDOW_MS) failures.set(key, { count: 1, startedAt: now });
  else entry.count += 1;
}

export function checkFamilyAccess(req, env = process.env, now = Date.now()) {
  const expected = String(env[FAMILY_CODE_ENV] || "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(expected)) {
    return { ok: false, status: 503, error: "가족 접속 코드가 서버에 설정되지 않았습니다. 관리자에게 문의하세요." };
  }
  const key = clientKey(req);
  if (tooManyFailures(key, now)) {
    return { ok: false, status: 429, error: "접속 코드 시도가 너무 많습니다. 잠시 후 다시 시도하세요." };
  }
  const code = readCode(req);
  if (code && safeEqualHex(sha256Hex(code), expected)) return { ok: true };
  recordFailure(key, now);
  return { ok: false, status: 401, error: code ? "가족 접속 코드가 올바르지 않습니다." : "가족 접속 코드가 필요합니다." };
}

export function requireFamilyAccess(req, res) {
  const result = checkFamilyAccess(req);
  if (result.ok) return true;
  res.status(result.status).json({ error: result.error });
  return false;
}

export function resetAccessFailuresForTests() {
  failures.clear();
}
