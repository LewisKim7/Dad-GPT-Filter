import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const bridge = new URL("../bridge/worker.py", import.meta.url);
const served = new URL("../public/worker.py", import.meta.url);
const normalize = (text) => text.replace(/\r\n/g, "\n");

test("bridge/worker.py and the served public/worker.py stay identical", () => {
  assert.equal(normalize(readFileSync(served, "utf8")), normalize(readFileSync(bridge, "utf8")));
});

const python = ["python3", "python"].find((cmd) => spawnSync(cmd, ["--version"]).status === 0);

test("prune_threads keeps only the most recently used threads", { skip: !python && "python not available" }, () => {
  const script = [
    "import importlib.util, json, sys",
    "spec = importlib.util.spec_from_file_location('worker', sys.argv[1])",
    "worker = importlib.util.module_from_spec(spec); spec.loader.exec_module(worker)",
    "threads = {f't{i}': {'conversationId': f'c{i}', 'updatedAt': i} for i in range(10)}",
    "threads['bad'] = 'not-a-dict'",
    "small = worker.prune_threads(dict(list(threads.items())[:3]), limit=5)",
    "print(json.dumps({'kept': sorted(worker.prune_threads(threads, limit=3)), 'small': len(small), 'max': worker.MAX_THREADS}))",
  ].join("\n");
  const run = spawnSync(python, ["-B", "-c", script, fileURLToPath(bridge)], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.deepEqual(result.kept, ["t7", "t8", "t9"]);
  assert.equal(result.small, 3);
  assert.ok(result.max > 0);
});
