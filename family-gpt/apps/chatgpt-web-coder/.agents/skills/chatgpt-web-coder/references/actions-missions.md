# Actions Missions

GitHub Actions is a bounded fallback for ChatGPT Web Coder, not the default development environment.

## Use a mission only for a real gap

Typical mission roles are:

- **Supply mission**: obtain or prepare a dependency, runtime, SDK, compiler, native library, generated input, cache or other external input that the sandbox can use but cannot obtain directly.
- **Transport mission**: carry an exact patch, bundle or archive when repeated connected file writes would be brittle, inefficient or unable to preserve binary/mode/history semantics.
- **Degraded execution mission**: perform a bounded edit/build/test/verification step only when the sandbox itself is unavailable or cannot sustain the task.

## Mission contract

Before dispatch, define:

- exact repository and expected source commit SHA;
- purpose of the mission;
- exact inputs and commands;
- expected outputs such as logs, artifacts, checksums or commits;
- minimum required permissions;
- terminal state and cleanup boundary.

If the expected source SHA no longer matches, stop and deliberately recover/rebase instead of applying the payload to the wrong base.

## Supply before remote execution

If the sandbox can faithfully run a capability after receiving the necessary bytes, prefer supplying those bytes and returning to the sandbox engineering loop. Do not move all development into Actions merely because initial acquisition is blocked.

## Exact transport

For substantial or binary-sensitive changes, an exact binary-safe patch or Git bundle can be preferable to many independent writes. Bind the payload to an expected base SHA and verify before application.

A representative patch flow is:

```text
verify current base == expected SHA
verify payload checksum
git apply --check change.patch
git apply change.patch
run repository-defined checks
inspect resulting diff
commit to the task branch
```

## Diagnose failures before retrying

A failed run is evidence to inspect. Distinguish where possible between:

- application/test failure;
- workflow or mission defect;
- permission/authentication failure;
- quota/platform/resource limit;
- stale source identity;
- transient runner/service failure.

Do not modify application source merely because a workflow is red. Do not blindly re-run the same failed mission. Without new evidence, one unchanged retry is the maximum when a transient failure is plausible.

## Remote state and cleanup

Use task-owned, collision-resistant names for temporary branches, workflows and artifacts. Keep exact recovery state while it still has debugging or handoff value, then remove temporary objects when ownership and terminal state are clear.

Cleanup must be recovery-aware and idempotent. Never delete unfamiliar state simply because it is old.

## Security

- Use minimum workflow permissions.
- Keep credentials and unrelated runner state out of artifacts.
- Do not expose or weaken the user's computer to avoid using a mission.
- Do not create permanent workflows unless the project deliberately adopts them as maintained infrastructure.
