import crypto from "node:crypto";
import { clientKey, createWindowCounter, requireFamilyAccess } from "../lib/access.js";
import { DAILY_LIMIT_ERROR, configuredModel, consumeDailyQuota, enqueueJob, workerOnline } from "../lib/runtime.js";

const attempts = createWindowCounter({ windowMs: 60_000 });
function allow(req) {
  const now = Date.now(); const key = clientKey(req);
  if (attempts.count(key, now) >= 6) return false;
  attempts.increment(key, now); return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!requireFamilyAccess(req, res)) return;
  if (!allow(req)) return res.status(429).json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요." });
  const prompt = String(req.body?.prompt || "").trim();
  const threadId = String(req.body?.threadId || crypto.randomUUID());
  if (!prompt || prompt.length > 24_000) return res.status(400).json({ error: "메시지는 1 - 24,000자여야 합니다." });
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(threadId)) return res.status(400).json({ error: "Invalid thread id" });

  const worker = await workerOnline();
  if (!worker.online) {
    const reason = worker.status?.modelAvailable === false ? "GPT-5.6 Sol을 현재 ChatGPT 계정에서 사용할 수 없습니다." : "유찬 PC의 ChatGPT worker가 오프라인입니다.";
    return res.status(503).json({ error: reason });
  }

  if (!(await consumeDailyQuota())) return res.status(429).json({ error: DAILY_LIMIT_ERROR });

  const id = crypto.randomUUID();
  const job = { id, threadId, prompt, model: configuredModel(), status: "queued", createdAt: Date.now(), updatedAt: Date.now() };
  await enqueueJob(job);
  return res.status(202).json({ jobId: id, status: "queued" });
}
