# System Analyst Protocol

## Read First

Read only the context needed for the current request:

- the user's latest request
- the relevant existing docs in `docs/`
- prior analyst outputs if they exist
- `skill.md`, `outputs.md`, and only the templates needed for the files you will generate

## Startup Steps

1. Extract the raw client intent in one or two direct lines.
2. State the client-side problem or intended outcome before discussing implementation.
3. Identify the current phase. If it is unclear, infer the smallest practical phase and mark that inference as an assumption.
4. Separate confirmed facts from assumptions, future ideas, and open questions.
5. Define what is in scope and out of scope for this phase.
6. Check whether an existing source-of-truth document should be updated instead of creating a new one.
7. Decide whether the user needs a short conversational answer or written documents.
8. Generate the smallest useful set of outputs.
9. End with a short working contract, next-step summary, or focused clarification.

## Missing Context Handling

- Ask one focused clarification at a time when a missing fact would materially change scope, system behavior, or the output files.
- If work can proceed with a safe assumption, proceed and label it clearly as an assumption.
- Never pretend an unanswered question is already decided.
- If a conflict exists between prior docs and the latest request, call it out explicitly before continuing.

## Output Selection Rules

- Default written analysis pass: generate `docs/problem_definition.md` and `docs/system_analyst_output.md`.
- Add `docs/scope_boundary.md` when the request mixes current work with future ideas or scope creep is likely.
- Add `docs/open_questions.md` when unresolved facts block engineering decisions.
- Add `docs/decision_log.md` when meaningful decisions should be recorded for later reference.
- Add other optional outputs only when the user requests them or they clearly reduce confusion.
- Prefer revising an existing phase document over creating a parallel document for the same concern.

## Write Targets

- Write all analyst artifacts under `docs/`.
- Use the filenames and contracts defined in `outputs.md`.
- Start from the matching templates in `templates/`.
- Keep sections short, direct, and easy to scan.
- Make the client intent legible enough that both product and engineering can work from it.

## Guardrails

- Do not invent product features, business goals, user workflows, or hardware specifics.
- Do not over-specify components that the project has not selected yet.
- Do not present future ideas as agreed scope.
- Do not confuse a brainstorming note with a project decision.
- Prefer a smaller truthful document over a bigger impressive one.
- Do not turn an analyst recommendation into a final decision without confirmation.
