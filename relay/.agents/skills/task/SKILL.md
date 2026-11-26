---
name: task
description: Implement one task of a feature plan, tests first, and report without committing.
argument-hint: <feature> <task-number>
arguments: [feature, number]
disable-model-invocation: true
---

Implement Task $number of docs/plans/$feature.md, following
docs/specs/$feature.md and AGENTS.md. Do only Task $number.
Write the tests first, named after the ACs they cover. Run the
task's verification command and report: the result, the files
you changed, and every decision you made that the spec and plan
did not settle. Do not commit.
