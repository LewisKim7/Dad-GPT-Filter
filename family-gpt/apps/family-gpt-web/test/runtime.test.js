import assert from "node:assert/strict";
import crypto from "node:crypto";
import { beforeEach, test } from "node:test";
import { getCache } from "@vercel/functions";
import { GENERATING_MAX_MS, enqueueJob, finishJob, getJob, leaseNextJob } from "../lib/runtime.js";

const cache = getCache({ namespace: "family-gpt-web-v3" });
const queuedJob = (extra = {}) => ({ id: crypto.randomUUID(), threadId: "thread-test", prompt: "hi", model: "gpt-5.6-sol", status: "queued", createdAt: Date.now(), updatedAt: Date.now(), ...extra });

beforeEach(async () => { await cache.delete("queue"); });

test("leaseNextJob marks stuck generating jobs uncertain and drops them from the queue", async () => {
  const stuck = queuedJob({ status: "generating", startedAt: Date.now() - GENERATING_MAX_MS - 1000 });
  const fresh = queuedJob();
  await enqueueJob(stuck);
  await enqueueJob(fresh);
  const leased = await leaseNextJob();
  assert.equal(leased.id, fresh.id);
  assert.equal((await getJob(stuck.id)).status, "uncertain");
  assert.deepEqual(await cache.get("queue"), [fresh.id]);
});

test("leaseNextJob keeps a generating job that is still within its window", async () => {
  const running = queuedJob({ status: "generating", startedAt: Date.now() });
  await enqueueJob(running);
  assert.equal(await leaseNextJob(), null);
  assert.equal((await getJob(running.id)).status, "generating");
  assert.deepEqual(await cache.get("queue"), [running.id]);
});

test("concurrent enqueues all end up in the queue", async () => {
  const jobs = Array.from({ length: 5 }, () => queuedJob());
  await Promise.all(jobs.map((job) => enqueueJob(job)));
  assert.deepEqual(new Set(await cache.get("queue")), new Set(jobs.map((job) => job.id)));
});

test("concurrent pulls lease a queued job only once", async () => {
  const job = queuedJob();
  await enqueueJob(job);
  const leases = await Promise.all([leaseNextJob(), leaseNextJob()]);
  assert.equal(leases.filter(Boolean).length, 1);
  assert.equal((await getJob(job.id)).leaseId, leases.find(Boolean).leaseId);
});

test("finishJob removes the job from the queue but keeps the others", async () => {
  const done = queuedJob();
  const waiting = queuedJob();
  await enqueueJob(done);
  await enqueueJob(waiting);
  assert.equal((await finishJob(done.id, { status: "completed", output: "ok" })).status, "completed");
  assert.deepEqual(await cache.get("queue"), [waiting.id]);
});
