# Recovery

Use this reference after a chat reset, sandbox loss, or whenever the relationship between the sandbox working tree and GitHub is unclear.

## Order of trust

```text
commit / PR head
    > immutable Git or Actions artifact
    > surviving sandbox working tree
    > conversation reconstruction
```

Chat preserves intent and explanations. Durable repository state preserves exact source bytes.

## Procedure

1. Inspect any surviving sandbox workspace before assuming it is empty or stale.
2. Identify the expected repository, task/PR and current commit SHA from GitHub.
3. Inspect task-owned branches, relevant workflow runs and artifacts when previous remote work may contain useful state.
4. Recover exact source from a commit, PR head, Git bundle/archive, artifact or connected repository read operation.
5. Compare recovered state with surviving sandbox changes before replacing or merging anything.
6. Preserve unfamiliar local or remote changes until ownership is understood.
7. Re-read the project instructions needed to restore the task boundary.
8. Resume from the recovered durable state.

## Drift

Branch and tag names can move. Before applying a payload, publishing a commit or performing cleanup, compare the expected immutable identity with the actual base.

If the base moved, recover the new state and deliberately rebase, merge or recreate the payload.

## Restart when cheaper

If a failed attempt leaves no reusable commit, patch, diagnosis, environment artifact or other durable result, clean up task-owned temporary state when safe and restart from the last known durable base.
