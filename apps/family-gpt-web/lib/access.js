import crypto from "node:crypto";

export const FAMILY_CODE_HEADER = "x-family-code";
export const FAMILY_CODE_ENV = "FAMILY_ACCESS_CODE_SHA256";

const FAIL_WINDOW_MS = 10 * 60_000;
const MAX_FAILURES = 20;
const MAX_TRACKED_CLIENTS = 5_000;

// Per-instance fixed-window counters keyed by client. Expired windows are swept (at most once
// per window, or when the cap is hit) so a long-lived instance does not grow the Map forever.
export function createWindowCounter({ windowMs, maxEntries = MAX_TRACKED_CLIENTS }) {
  const entries = new Map();
  let lastSweep = 0;
  function sweep(now) {
    if (now - lastSweep < windowMs && entries.size < maxEntries) return;
    lastSweep = now;
    for (const [key, entry] of entries) if (now - entry.startedAt >= windowMs) entries.delete(key);
    // Still at the cap with live windows: drop the oldest ones first.
    for (const key of entries.keys()) { if (entries.size < maxEntries) break; entries.delete(key); }
  }
  return {
    count(key, now = Date.now()) {
      const entry = entries.get(key);
      return entry && now - entry.startedAt < windowMs ? entry.count : 0;
    },
    increment(key, now = Date.now()) {
      sweep(now);
      const entry = entries.get(key);
      if (entry && now - entry.startedAt < windowMs) { entry.count += 1; return entry.count; }
      entries.delete(key);
      entries.set(key, { count: 1, startedAt: now });
      return 1;
    },
    clear() { entries.clear(); lastSweep = 0; },
    get size() { return entries.size; },
  };
}

const failures = createWindowCounter({ windowMs: FAIL_WINDOW_MS });

export function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

export function safeEqualHex(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function clientKey(req) {
  return String(req.headers?.["x-forwarded-for"] || req.headers?.["x-real-ip"] || "unknown").split(",")[0].trim();
}

function readCode(req) {
  const raw = req.headers?.[FAMILY_CODE_HEADER];
  const value = String(Array.isArray(raw) ? raw[0] : raw || "").trim();
  if (!value) return "";
  // Browsers send encodeURIComponent(code) so non-ASCII codes survive HTTP headers.
  try { return decodeURIComponent(value).trim(); } catch { return value; }
}

export function checkFamilyAccess(req, env = process.env, now = Date.now()) {
  const expected = String(env[FAMILY_CODE_ENV] || "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(expected)) {
    return { ok: false, status: 503, error: "가족 접속 코드가 서버에 설정되지 않았습니다. 관리자에게 문의하세요." };
  }
  const key = clientKey(req);
  if (failures.count(key, now) >= MAX_FAILURES) {
    return { ok: false, status: 429, error: "접속 코드 시도가 너무 많습니다. 잠시 후 다시 시도하세요." };
  }
  const code = readCode(req);
  if (code && safeEqualHex(sha256Hex(code), expected)) return { ok: true };
  failures.increment(key, now);
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
