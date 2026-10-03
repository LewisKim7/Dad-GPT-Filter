import { requireFamilyAccess } from "../lib/access.js";
import { getCodexStatus, normalizeMessages, runCodexChat } from "../lib/codex.js";
import { DAILY_LIMIT_ERROR, consumeDailyQuota } from "../lib/runtime.js";

const WINDOW_MS = 60_000;
const attempts = new Map();
function clientKey(req) { return String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown").split(",")[0].trim(); }
function allow(req) {
  const now = Date.now(); const key = clientKey(req); const current = attempts.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) { attempts.set(key, { count: 1, startedAt: now }); return true; }
  if (current.count >= 6) return false;
  current.count += 1; return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!requireFamilyAccess(req, res)) return;
  if (!allow(req)) return res.status(429).json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요." });
  // Reject bad input and a disconnected session before spending the shared daily quota.
  const messages = normalizeMessages(req.body?.messages);
  if (!messages.length || messages.at(-1).role !== "user") return res.status(400).json({ error: "마지막 메시지는 사용자 메시지여야 합니다." });
  try {
    if (!(await getCodexStatus()).connected) return res.status(503).json({ error: "Codex 세션이 연결되어 있지 않습니다." });
    if (!(await consumeDailyQuota())) return res.status(429).json({ error: DAILY_LIMIT_ERROR });
    const result = await runCodexChat({ messages, model: req.body?.model || "auto" });
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Codex request failed";
    return res.status(message.includes("연결되어 있지") ? 503 : 500).json({ error: message });
  }
}
