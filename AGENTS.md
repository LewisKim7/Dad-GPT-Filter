# ChatGPT Web Coder entry point

When repository development is requested from an ordinary chat surface with a disposable or sandboxed code-execution environment, read `.agents/skills/chatgpt-web-coder/SKILL.md` before working on the repository task.

ChatGPT Web Coder is a workflow skill, not a model selector. Use whichever ChatGPT model is active in the conversation.

Loading the skill is a readiness step, not a reason to use GitHub Actions. Normal engineering work should stay in the ChatGPT sandbox work container when it is available and sufficient.

The repository itself defines its runtimes, services, dependencies, architecture, build system and verification requirements. This skill supplies continuity and missing execution capability; it does not replace the project's engineering method.

Treat exact GitHub commit and PR state as durable source truth, preserve unrelated work and do not make access to the user's computer a dependency of the workflow.

When this repository is used as a template, keep this entry point and add the project's own engineering instructions alongside it.
