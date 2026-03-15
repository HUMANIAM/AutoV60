# Agent Git And GitHub Rules

This project follows the AISWTeam standard Git, GitHub, and workflow rules.
All agents working in this repository must use this file as the operating
contract for commits, pull requests, review handling, and CI completion.

## Git Commit Rules

- Stage only task-relevant files.
- Never mix unrelated dirty-worktree files into the same commit.
- Use short, precise commit messages.
- Split commits bottom-up by dependency order when a change spans layers.
- Do not switch branches with partial work left behind.
- Before switching branches, ensure current-branch changes are committed.
- If work is not ready to commit, stop and ask before switching branches.

## GitHub Rules

- Push the working branch after the implementation commit set is complete.
- Create a PR if one does not already exist for the branch.
- Monitor PR checks until they are green.
- If CI fails, diagnose the failing job, apply the smallest correct fix,
  re-run the relevant local checks, push again, and continue until CI is green.
- Every substantive PR review comment must receive an explicit reply.
- If a review comment is applied, the reply must point to the resolution:
  commit hash, updated file/path, and a short note on what changed.
- If a review comment is not applied, the reply must justify why.
- Do not leave review threads without closure.

## Required Workflow

1. Commit only the scoped task changes.
2. Self-review the diff before pushing.
3. Push the branch to origin.
4. Open or update the PR.
5. Watch CI until green.
6. Resolve review comments explicitly.
7. Do not report the work complete while the branch PR CI is red.
