# System Analyst Output Contract

## Target Folder

- `docs/`

## Mandatory Outputs For A Written Analysis Pass

- `docs/problem_definition.md`
- `docs/system_analyst_output.md`

## Optional Outputs

- `docs/scope_boundary.md`
- `docs/open_questions.md`
- `docs/decision_log.md`
- `docs/phase_n_vision.md`
- `docs/requirements.md`
- `docs/assumptions_and_risks.md`

## Naming And Structure

- Use lowercase snake_case file names.
- Keep one concern per document.
- Use short sections and direct language.
- Mark assumptions explicitly.
- Do not create optional files unless they reduce confusion or the user requests them.
- Prefer updating an existing phase document over creating a second competing source of truth.

## Minimum Contract

- `problem_definition.md` must state the problem, why the current or manual approach is insufficient, what this phase proves, and what success looks like now.
- `system_analyst_output.md` must state interpreted client intent, current phase, scope, non-goals, core system behavior, assumptions, risks, and a working contract statement.

## Ownership And Status

- Analyst outputs may contain proposals, recommended boundaries, and open questions.
- Final scope and priority decisions remain with the user or project owner.
- When a section reflects an analyst proposal rather than a confirmed decision, label it clearly.
