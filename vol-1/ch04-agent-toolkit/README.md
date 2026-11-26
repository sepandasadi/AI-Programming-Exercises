# Vol. 1, Ch. 4 — Your Agent Toolkit, Tool-Agnostic

Take a small Relay search citation fix through explore, plan, implement and verify. The fixture uses the `heading`, `path` and one-based `line` fields from Relay's `SearchResult`. It runs independently of the Relay app.

Use Node.js 22.18 or newer. From this chapter folder, run the scripted session:

```sh
node exercise-02-run-a-session/replay.mts
```

The replay stages the fixture in a temporary directory, runs the supplied tests, demonstrates a denied edit, applies a prepared replacement and reruns the tests. It expects a specific assertion to fail at baseline and both tests to pass after the edit. It exits nonzero if those observations differ. The actions are scripted. The filesystem work and test runs are real. The replay needs no model, credentials, package install or internet connection.

| Exercise | Verification |
| --- | --- |
| [Map the boundary](exercise-01-map-the-boundary/) | Account for each proposed action and identify where it is controlled |
| [Run a bounded session](exercise-02-run-a-session/) | Observe one assertion fail, then two tests pass with the same test file |
| [Review the result](exercise-03-review-the-result/) | Inspect the one-file diff and rerun the tests independently |
| [Challenge: Switch harnesses](challenge/) | Explain which evidence transfers and how you would verify the new boundary |
| [Quiz](quiz.md) | Compare your answers with the reasoning |

Exercise 2 offers a live run with an agent you already have. The manual path and replay cover the same workflow offline.
