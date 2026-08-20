# Fix Test Coverage

Use the Angular Testing Agent.

Fix the failing unit test for the user-management feature.

Run:
npm run test:coverage

Only modify the relevant .spec.ts files.
Do not modify any production .ts files.
Do not delete existing tests.

After fixing the test setup, run `npm run test:coverage` 2-3 times in a row
to confirm the result is stable, not just green once. If the same test
fails in a different file on each run, that is not N separate spec bugs —
it is very likely a test-runner isolation/config issue (e.g. Vitest running
spec files without isolation). Diagnose and report that root cause even
though fixing it may require touching a non-spec file (e.g. angular.json);
confirm with the user before changing anything outside .spec.ts files.

## Coverage bar

Aim for 90% statement/line coverage per file for any file with meaningful
logic. When asked to raise coverage:

- Read `coverage`'s per-file breakdown (or `npm run test:coverage`'s table)
  to find files below 90% and their uncovered line numbers before writing
  anything.
- Add tests for the actual uncovered behavior at those lines — don't add
  assertion-free tests just to move the percentage.
- If a file genuinely can't reach 90% (unreachable defensive branch, trivial
  boilerplate), say so explicitly in the report instead of forcing it.
- Re-run `npm run test:coverage` 2-3 times at the end to confirm both
  correctness and stability, and report before/after % per file touched.
