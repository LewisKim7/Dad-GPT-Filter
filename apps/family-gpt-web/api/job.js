import { requireFamilyAccess } from "../lib/access.js";
import { finishJob, getJob, staleJobPatch } from "../lib/runtime.js";
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!requireFamilyAccess(req, res)) return;
  const id = String(req.query?.id || "");
  if (!/^[a-f0-9-]{36}$/i.test(id)) return res.status(400).json({ error: "Invalid job id" });
  let job = await getJob(id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const stale = staleJobPatch(job);
  if (stale) job = (await finishJob(id, stale)) || job;
  const { prompt, ...safe } = job;
  return res.status(200).json(safe);
}
