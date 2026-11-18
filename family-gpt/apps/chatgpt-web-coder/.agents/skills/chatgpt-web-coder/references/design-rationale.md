# ChatGPT Web Coder Design Rationale

This document records the stable reasoning behind the workflow. It is maintainer context, not always-loaded runtime policy.

## What this is

ChatGPT Web Coder is a repository-local continuity and fallback skill for ordinary ChatGPT web conversations. It is intentionally **not named after an OpenAI model** because the workflow should remain independent of whichever model is active in ChatGPT.

The shortest model is:

```text
ChatGPT web conversation
    intent and reasoning

Sandbox work container
    primary disposable development workstation

GitHub
    exact durable repository state

GitHub Actions mission
    bounded fallback capability, transport or execution
```

## Stable design decisions

- **Model-neutral naming.** The workflow must not imply that a particular model is running. The active ChatGPT model does the work.
- **Sandbox first.** Interactive edit/build/test/debug loops belong in the sandbox whenever it is capable.
- **GitHub is durable truth.** Exact commits and PR heads outrank conversational reconstruction for source identity.
- **Repository requirements define engineering.** The skill does not choose replacement technologies merely because they are easier to execute.
- **The user's computer is outside the workflow.** Ordinary use should not require direct access to the user's machine.
- **Actions is bounded fallback.** Remote execution carries latency, quota, artifact and cleanup overhead and should not become the default workstation.
- **Exact transport is first-class.** A patch or bundle can be the right publication path for large, binary-sensitive or connector-constrained changes.
- **Diagnose before retrying.** Remote failures should be understood from evidence instead of triggering blind reruns or unrelated source edits.
- **Concurrency is assumed.** Humans, CI and other agents may change branches and remote state at any time.
- **Completion claims are evidence-bounded.** Report only what actually ran.

## Why repository-local discovery

The skill lives under `.agents/skills/chatgpt-web-coder/` and the repository `AGENTS.md` points to it. This makes the workflow travel with the project or template without requiring a global installation.

For an existing project, copy the complete skill directory once and merge the short entry-point instruction into the project's existing `AGENTS.md`. For a new project, starting from the template is simpler.

## Why GitHub Actions remains optional

Actions exists to fill a real execution or transport gap. It should not be permanently created merely to prove the workflow works. Temporary remote state should be task-owned, bounded and cleaned up after its value ends.

## Maintenance discipline

When changing this workflow:

1. keep `SKILL.md` focused on current runtime policy;
2. keep operational detail in references;
3. preserve model-neutral terminology;
4. avoid adding rules unless they prevent a repeatable failure;
5. keep the healthy user experience simple: provide a repository and a development task.
