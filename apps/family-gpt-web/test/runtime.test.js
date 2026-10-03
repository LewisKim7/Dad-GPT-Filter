import assert from "node:assert/strict";
import crypto from "node:crypto";
import { beforeEach, test } from "node:test";
import { getCache } from "@vercel/functions";
import { GENERATING_MAX_MS, enqueueJob, getJob, leaseNextJob } from "../lib/runtime.js";

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
