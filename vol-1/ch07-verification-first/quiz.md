# Quiz: Verification First

1. Why do tests written by the agent that wrote the code catch fewer
   bugs than tests written first, from the spec?
2. In the two-session workflow, what does session A produce, and how
   do you know its tests fail "for the right reason"?
3. The test-writing agent checked its expected values against a
   throwaway implementation. What is wrong with that?
4. Name three locks on test files and what each one catches that the
   others miss.
5. Why is `` `P${n}` as Priority `` a review item, and what replaced it?
6. Why must `created_at` carry an offset, and where is that enforced?
7. Name the four kinds of property in section 7.4 and give one Relay
   example of each.
8. What three things do you do with every counterexample a property
   finds?
9. Sort these surviving mutants: an unanchored regex nothing tests;
   `offset < OPEN` to `offset <= OPEN` where the case returns earlier;
   an error message replaced with `""`.
10. What one rule made reviewer B's report more useful than reviewer
    A's?

## Answers

1. They share its understanding: a misread boundary is in both the
   code and the tests, so the tests agree with the code rather than
   with the spec.
2. Failing tests and a stub that throws; every failure is the stub's
   own error, not an import error or a typo.
3. It is circular: a misreading in the throwaway code becomes the
   expected value. Expected values come from the spec and a calendar.
4. The instruction (the agent knows the rule and has a legitimate exit),
   a mechanical guard (read-only file, deny rule or hook: stops edits
   the agent attempts anyway), and `git diff --exit-code -- '*.test.ts'`
   afterwards (catches anything that got through, such as a script
   writing the file).
5. It tells the checker to stop checking: `"P7"` would compile. A
   `PRIORITIES` lookup returns `Priority | undefined` under
   `noUncheckedIndexedAccess`, so the compiler forces the check, and
   `satisfies` makes a missing SLA row a compile error.
6. Without one, `new Date` reads it in the server's local time zone, so
   deadlines depend on where the server runs. `IssueSchema` rejects it
   at the boundary (AC-10).
7. Model: `addBusinessTime` against a minute-by-minute clock.
   Invariant: the result is always inside a business window. Law:
   adding a then b equals adding a + b. Metamorphic: a term found in
   upper case, lower case, NFC and NFD form.
8. Shrink it (the tool does), fix the bug (spec first if it is a
   behavior question), and pin it as an ordinary example test.
9. Real gap (write a test), equivalent mutant (no test can kill it),
   not worth killing (the error type is the contract, not its wording).
10. Confirm every behavior claim by running code and show the input and
    the actual vs expected output; report suspicions separately.
