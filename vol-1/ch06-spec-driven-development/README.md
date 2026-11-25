# Vol. 1, Ch. 6: Spec-Driven Development

Exercises for the chapter's spec, plan and one-prompt, one-commit loop.
Start from tag `v1-ch06`, where Relay has the docs search feature built in
the chapter's worked example (`relay/docs/specs/docs-search.md`,
`relay/docs/plans/docs-search.md`). Spec and plan templates are in
`relay/docs/templates/`.

| Folder | Goal | Verification |
| --- | --- | --- |
| [exercise-01-tighten-a-spec](exercise-01-tighten-a-spec/) | Rewrite a vague request as a full spec | An agent's ambiguity pass finds nothing that changes behavior |
| [exercise-02-spec-to-plan](exercise-02-spec-to-plan/) | Get a plan from your agent and review it | Every criterion appears in the coverage table |
| [exercise-03-one-prompt-one-commit](exercise-03-one-prompt-one-commit/) | Implement the stale issue report, one task per session | `spec:check` passes; a deliberately broken check fails its test |
| [challenge](challenge/) | Rescue a run that drifted | The final diff touches only the files your plan lists |
| [quiz.md](quiz.md) | Ten questions with answers | |
