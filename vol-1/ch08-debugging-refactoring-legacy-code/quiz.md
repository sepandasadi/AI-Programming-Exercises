# Quiz — Debugging, Refactoring & Legacy Code

1. What does a 200 with an empty array tell you about a search failure?
2. How would you test a hypothesis that the failure involves query decoding?
3. Why put the missing `failover` result in a separate test?
4. Which parts of the response do the characterization tests compare?
5. What does extracting the lookup function let you test directly?
6. When can you remove the old field in an expand-contract migration?
7. What extra evidence would you want before replacing the legacy service?
8. What should you preserve when restarting an agent after a loop?

## Answers

1. The handler returned a successful response without matches. You still need evidence from the input, the corpus and the matching predicate.
2. Compare the decoded query in the handler against the request and a known working control. Change one input variable at a time.
3. The characterization checks describe behavior you intend to keep. The incident test states the behavior you intend to change.
4. Status, content type on success, JSON values including array order and required keys, and error messages on the sampled inputs.
5. Which records match, how they are ordered and how their previews are constructed, without creating an HTTP request.
6. Once consumers have switched, you have evidence the old field is unused, and the rollback plan no longer depends on it.
7. Run a representative compatibility suite against both implementations and compare outputs, error behavior and latency with realistic data.
8. The exact reproduction, failing output, confirmed observations, paths and revision, uncommitted changes, and the next untested hypothesis.
