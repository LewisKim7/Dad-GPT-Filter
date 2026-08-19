# ChatGPT Web Coder

[한국어 README](README.ko.md)

**Version 1.0.0**

> **ChatGPT Web Coder is a repository workflow/skill, not an OpenAI model.** It does not select or switch models. The reasoning and coding are performed by whichever compatible model is active in the ordinary ChatGPT conversation.

ChatGPT Web Coder is a repository template for reliable software development from ordinary ChatGPT web chat. It follows the workflow introduced in the GeekNews/Hada article: ordinary ChatGPT → GitHub → ChatGPT sandbox → GitHub publication, with GitHub Actions used only when the normal path is insufficient.

## Why use ordinary ChatGPT for coding?

- With GitHub access, ordinary ChatGPT can inspect repositories, plan changes, edit code, verify work in the sandbox, and publish commits/PRs without opening Codex for every task.
- OpenAI's current coding evaluations place **GPT-5.6 Sol above GPT-5.6 Luna overall**, so strong reasoning and coding can often stay in ordinary ChatGPT when Sol is active.
- **Codex still has the stronger dedicated agent harness** for long terminal loops, large repo-wide changes, and sustained autonomous implementation.
- Ordinary ChatGPT and Codex use different usage mechanisms. This workflow is useful for conserving Codex agentic usage, but OpenAI does **not** explicitly guarantee that every GitHub-assisted chat workflow consumes exactly zero Codex credits.

Practical default: **ordinary ChatGPT + ChatGPT Web Coder first; Codex only when the task genuinely benefits from the dedicated agent environment.**

## Recommended workflow

```text
Ordinary ChatGPT web conversation
        ↓
GitHub Plugin + ChatGPT Codex Connector
        ↓
Target repository with ChatGPT Web Coder skill
        ↓
ChatGPT sandbox work container
(edit → build/test/debug → verify)
        ↓
GitHub commit / branch / PR
        ↓
GitHub Actions only for a real capability gap
```

## Quick start

For the ChatGPT Web path:

1. For a new project, create it from this repository/template so the skill is already embedded.
2. In ChatGPT, install/connect the **GitHub Plugin**.
3. On GitHub, install the **ChatGPT Codex Connector** and grant it access to the target repository.
4. In an ordinary ChatGPT conversation, provide the repository URL and ask for the development work you want.

Example:

```text
https://github.com/OWNER/REPO

Inspect the latest repository state, implement the requested feature,
run the relevant checks in the ChatGPT sandbox, and publish the verified
change to a branch or PR. Use GitHub Actions only if the normal sandbox or
GitHub path has a real capability gap.
```

You should not need to mention ChatGPT Web Coder explicitly. The repository's `AGENTS.md` points the model to the embedded skill.

## New vs existing projects

### New projects

Start from this repository/template. The project will already contain:

```text
AGENTS.md
.agents/skills/chatgpt-web-coder/
```

### Existing projects

Copy the complete directory once:

```text
.agents/skills/chatgpt-web-coder/
```

Then merge the short entry-point instructions from this repository's `AGENTS.md` into the target project's existing agent instructions. Keep the project's own engineering guidance.

There is **no global ChatGPT Web Coder installation** and no need to maintain a second central copy.

## What the skill does

On repository work, the model should quietly:

1. read `AGENTS.md` and `.agents/skills/chatgpt-web-coder/SKILL.md`;
2. identify the exact repository/PR/commit state;
3. establish the required source state in the ChatGPT sandbox;
4. inspect available sandbox capabilities before acquiring anything;
5. perform normal edit/build/test/debug work in the sandbox;
6. use GitHub Actions only for a genuine capability, transport or execution gap;
7. verify the behavior required by the repository and task;
8. publish the exact verified change through the simplest reliable GitHub path;
9. report only what actually ran.

## GitHub Actions policy

GitHub Actions is **fallback infrastructure, not the default coding environment**.

Do not create permanent workflows merely because this skill is installed. An Actions mission is appropriate only when the sandbox or normal GitHub path cannot safely or efficiently provide a required capability or exact transport.

Detailed rules live in [`actions-missions.md`](.agents/skills/chatgpt-web-coder/references/actions-missions.md).

## Recovery

GitHub is the durable source of exact repository state. Prefer recovery in this order:

```text
commit / PR head
    > immutable Git or Actions artifact
    > surviving sandbox working tree
    > conversation reconstruction
```

See [`recovery.md`](.agents/skills/chatgpt-web-coder/references/recovery.md).

## Repository layout

```text
AGENTS.md
    -> small repository entry point

.agents/skills/chatgpt-web-coder/
  SKILL.md
      -> canonical runtime policy
  references/
    actions-missions.md
      -> bounded GitHub Actions fallback rules
    recovery.md
      -> recovery after sandbox/chat/source ambiguity
    design-rationale.md
      -> maintainer design memory
```

## Important naming note

The name **ChatGPT Web Coder** deliberately describes the workflow surface rather than a model. Model availability can change over time; the repository should continue to work with whichever compatible ChatGPT model is active.