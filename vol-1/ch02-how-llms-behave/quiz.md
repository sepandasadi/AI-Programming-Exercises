# Quiz — How LLMs Behave

1. Why can two models report different token counts for the same request?
2. How can a request fit in the context window but miss the governing rule?
3. What does lowering temperature change?
4. What can pass a JSON schema and still fail Relay's triage contract?
5. Why could a short answer cost more than its visible text suggests?
6. What extra information is needed to price a cache hit?
7. What timer would you record for a program that needs to parse the full response?
8. What can a 20-run sample on one issue tell you about a model?

## Answers

1. Tokenizers segment text differently, and request framing can differ.
2. The model might use competing information, overlook the rule, or apply it incorrectly even when the rule is present.
3. It makes a positive-temperature sampler favor higher-scoring candidates more strongly. The effect depends on the endpoint and the rest of its decoding setup.
4. A correctly formatted UTC timestamp with the wrong time.
5. The endpoint may bill reasoning tokens in addition to visible output, or the workflow may have made other calls.
6. The number of cached tokens, the relevant read and uncached input prices, and whether the usage total includes the cached subset.
7. Elapsed time until the full response is available and parsed. Record what is included in that interval.
8. It shows how that setup behaved on that issue. More cases and controlled comparisons are needed for a broader conclusion.
