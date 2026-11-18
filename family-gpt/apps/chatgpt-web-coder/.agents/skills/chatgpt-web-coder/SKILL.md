---
name: chatgpt-web-coder
description: Reliable repository development from ordinary ChatGPT web chat using the chat sandbox first, GitHub as durable source truth, and bounded GitHub Actions only when the normal path is insufficient.
compatibility: Requires access to durable repository state. The fully specified ChatGPT Web path requires both the GitHub Plugin and the ChatGPT Codex Connector GitHub App for the target repository. GitHub Actions access is required only when an Actions mission is needed.
metadata:
  version: "1.0.0"
---

# ChatGPT Web Coder

ChatGPT Web Coder is a repository-local workflow skill for software development from an ordinary ChatGPT conversation. It is **not an OpenAI model name** and does not switch the conversation to any particular model. The active ChatGPT model performs the reasoning and coding.

The normal path is simple:

```text
ordinary ChatGPT web chat
        ↓
GitHub Plugin + ChatGPT Codex Connector
        ↓
exact target repository state
        ↓
ChatGPT sandbox work container
(edit → build/test/debug → verify)
        ↓
GitHub commit / branch / PR
        ↓
GitHub Actions only for a real capability gap
```

## Core invariants

1. **Discover early, activate late.** Read this skill before repository development, but do not create remote infrastructure merely because the skill exists.
2. **Resolve exact source before editing.** Identify the intended repository, branch/PR and immutable commit SHA. Materialize or reconstruct the exact target state before modifying source.
3. **Sandbox first.** Prefer the ChatGPT sandbox work container for inspection, editing, builds, tests, linting, formatting, services and iterative debugging.
4. **Inventory before acquiring.** Check what the sandbox already provides before installing tools, downloading dependencies or dispatching remote work.
5. **The repository defines the engineering method.** Follow its runtimes, dependencies, architecture, build system and verification requirements. Do not substitute technologies merely because they are easier to run.
6. **GitHub is durable source truth.** Conversation text preserves intent; exact commits, PR heads and repository objects preserve source bytes.
7. **Assume concurrent actors.** Humans, CI and other agents may move branches or create state. Re-resolve mutable refs before consequential writes and preserve unfamiliar work.
8. **Choose the simplest exact publication path.** Small text changes may use connected file writes; larger or binary-sensitive changes may use Git objects or a bounded Actions transport mission.
9. **Diagnose before retrying.** Inspect actual errors, logs and partial results before retrying or changing source.
10. **Do not depend on the user's computer.** Ordinary repository development should not require direct host access.
11. **Evidence bounds completion claims.** Report only checks and operations that actually ran.

## Silent readiness preflight

Before editing:

1. identify the repository and requested task;
2. resolve the intended branch or PR to its current commit SHA;
3. inspect any surviving sandbox workspace before replacing it;
4. establish a complete working tree for the exact target state when the task requires repository-wide editing or execution;
5. read the repository declarations needed to understand its toolchain and verification commands;
6. inventory available sandbox capabilities;
7. determine which connected GitHub read/write operations are available;
8. consider GitHub Actions only if a genuine gap later appears.

Keep this preflight quiet when the normal path is healthy.

## Work in the sandbox first

Treat the sandbox as a disposable development workstation. Prefer normal iterative engineering there whenever the required repository state and tools are available.

If direct Git network access is unavailable, use connected GitHub reads or another exact repository transport to recover the required state. Do not invent missing files or reconstruct substantial source from conversational prose.

If a required dependency or tool is missing, first try a safe sandbox-local setup. If the sandbox can run the capability but cannot obtain the required bytes, use a bounded supply mission rather than moving the whole engineering loop to remote execution.

## GitHub Actions is fallback, not default

Use an Actions mission only when it materially reduces risk or fills a real gap, such as:

- the sandbox cannot obtain or execute a repository-required capability;
- the sandbox itself is unavailable or cannot sustain the task;
- an exact patch/bundle is safer than many repeated file writes;
- binary, mode, rename or Git-history semantics need deterministic transport;
- the connected GitHub publication path is observably constrained or unreliable after diagnosis.

Do not create permanent Actions workflows just because this skill is installed.

Read [`references/actions-missions.md`](references/actions-missions.md) before dispatching an Actions mission.

## Publish exact changes

Capture the expected base SHA before substantial publication work. If the base moved, recover the new durable state and deliberately rebase, merge or recreate the payload.

Prefer exact source bytes over prose reconstruction. Verify the resulting diff and run the repository-defined checks applicable to the task before claiming completion.

## Recovery

After chat reset, sandbox loss or source ambiguity, read [`references/recovery.md`](references/recovery.md).

Prefer recovery in this order:

```text
commit / PR head
    > immutable Git or Actions artifact
    > surviving sandbox working tree
    > conversation reconstruction
```

## Completion report

At completion, state:

- what exact state changed or was published;
- what checks actually ran and their results;
- any check that could not run and the exact blocker;
- whether degraded remote execution through GitHub Actions was required.

Normal successful tasks should not burden the user with internal workflow mechanics.

## Maintaining this skill

When modifying the workflow itself rather than merely using it, read [`references/design-rationale.md`](references/design-rationale.md) first.