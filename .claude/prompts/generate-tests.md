# Generate Tests

Use the Angular Testing Agent.

Generate unit tests for the requested Angular file or feature.

Requirements:

- Inspect the production `.ts` file first.
- Check whether a `.spec.ts` already exists.
- If it exists, add missing tests instead of replacing it.
- If it doesn't exist, create it.
- Test important behavior, branches, success and error cases.
- Only modify `.spec.ts` files.
- Do not modify production code.
- Do not delete existing tests.
- Run the relevant tests after creating them.
- Report what tests were added.
