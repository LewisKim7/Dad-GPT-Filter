import { getCache } from "@vercel/functions";
import { safeEqualHex, sha256Hex } from "./access.js";

const cache = getCache({ namespace: "family-gpt-web-v3" });
const WORKER_TOKEN_HASH = "32c454da3f3fff65b577751c838030ff23d934697b5ec6ca08ae8baffd08a53b";
const JOB_TTL_SECONDS = 60 * 60;
const WORKER_TTL_SECONDS = 60;
const QUEUE_KEY = "queue";
const DAILY_TTL_SECONDS = 2 * 24 * 60 * 60;
const DEFAULT_DAILY_LIMIT = 200;
// A queued job that no worker leased within this window is failed with a clear message.
export const QUEUED_MAX_MS = 15 * 60_000;
// Worker request timeout is 900s; allow a minute for the result POST and retries.
export const GENERATING_MAX_MS = 16 * 60_000;
export const DAILY_LIMIT_ERROR = "오늘 사용할 수 있는 질문 수를 모두 사용했습니다. 내일 다시 시도하세요.";
const STALE_QUEUED_ERROR = "Mac mini worker가 요청을 받지 못해 처리되지 않았습니다. 잠시 후 다시 보내 주세요.";
const STALE_GENERATING_ERROR = "응답 연결이 중간에 끊겼습니다. 중복 전송을 막기 위해 자동 재전송하지 않았습니다.";

export function configuredModel() {
  return "gpt-5.6-sol";
}

export function workerAuthorized(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  return safeEqualHex(sha256Hex(token), WORKER_TOKEN_HASH);
}

function dailyLimit() {
  const value = Number.parseInt(String(process.env.FAMILY_DAILY_LIMIT || ""), 10);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_DAILY_LIMIT;
}

// Best-effort global daily cap shared by GPT Web jobs and Codex calls (not atomic across instances).
export async function consumeDailyQuota(now = Date.now()) {
  const day = new Date(now + 9 * 60 * 60_000).toISOString().slice(0, 10); // KST day
  const key = `daily:${day}`;
  const used = Number(await cache.get(key)) || 0;
  if (used >= dailyLimit()) return false;
  await cache.set(key, used + 1, { ttl: DAILY_TTL_SECONDS });
  return true;
}

export async function getWorkerStatus() {
  return (await cache.get("worker:status")) || null;
}

export async function setWorkerStatus(status) {
  await cache.set("worker:status", { ...status, lastSeen: Date.now() }, { ttl: WORKER_TTL_SECONDS });
}

export async function workerOnline() {
  const status = await getWorkerStatus();
  if (!status) return { online: false, status: null };
  const fresh = Date.now() - Number(status.lastSeen || 0) < 20_000;
  return { online: fresh && status.ready === true, status };
}

export async function enqueueJob(job) {
  await cache.set(`job:${job.id}`, job, { ttl: JOB_TTL_SECONDS });
  const current = await cache.get(QUEUE_KEY);
  const queue = Array.isArray(current) ? current.filter((id) => typeof id === "string") : [];
  const next = [...queue.filter((id) => id !== job.id), job.id].slice(-20);
  await cache.set(QUEUE_KEY, next, { ttl: JOB_TTL_SECONDS });
}

export async function getJob(id) {
  return (await cache.get(`job:${id}`)) || null;
}

export function staleJobPatch(job, now = Date.now()) {
  if (job?.status === "queued" && now - Number(job.createdAt || 0) > QUEUED_MAX_MS) {
    return { status: "failed", error: STALE_QUEUED_ERROR, completedAt: now };
  }
  if (job?.status === "generating" && now - Number(job.startedAt || 0) > GENERATING_MAX_MS) {
    return { status: "uncertain", error: STALE_GENERATING_ERROR };
  }
  return null;
}

export async function setJob(id, value) {
  await cache.set(`job:${id}`, value, { ttl: JOB_TTL_SECONDS });
}

async function setQueue(queue) {
  await cache.set(QUEUE_KEY, queue.slice(-20), { ttl: JOB_TTL_SECONDS });
}

export async function leaseNextJob() {
  const current = await cache.get(QUEUE_KEY);
  const queue = Array.isArray(current) ? [...current] : [];
  let changed = false;
  const keep = [];
  let leased = null;

  for (const id of queue) {
    const job = await getJob(id);
    if (!job) { changed = true; continue; }
    if (["completed", "failed", "uncertain"].includes(job.status)) { changed = true; continue; }
    if (job.status === "queued") {
      const stale = staleJobPatch(job);
      if (stale) { await setJob(id, { ...job, ...stale, updatedAt: Date.now() }); changed = true; continue; }
    }
    if (!leased && job.status === "queued") {
      leased = { ...job, status: "generating", startedAt: Date.now(), updatedAt: Date.now() };
      await setJob(id, leased);
      keep.push(id);
      continue;
    }
    keep.push(id);
  }
  if (changed || keep.length !== queue.length) await setQueue(keep);
  return leased;
}

export async function finishJob(id, patch) {
  const current = await getJob(id);
  if (!current) return null;
  const next = { ...current, ...patch, updatedAt: Date.now() };
  await setJob(id, next);
  const queue = await cache.get(QUEUE_KEY);
  if (Array.isArray(queue) && queue.includes(id)) await setQueue(queue.filter((value) => value !== id));
  return next;
}
