# SonarCloud -- Simple Guide

## 1. What is SonarCloud?

SonarCloud is a **code quality tool**.

Think of it like a **code reviewer that automatically checks your
code**.

It looks at your source code and tells you things such as:

-   🐛 Possible bugs
-   🧹 Code smells
-   🔐 Security problems
-   🧪 Test coverage
-   📋 Duplicate code
-   📖 Maintainability problems

The goal is not simply to make the code "work".

The goal is to make the code:

> **Correct + Secure + Easy to understand + Easy to maintain**

------------------------------------------------------------------------

# 2. What is a Code Smell?

A **code smell** is code that may work correctly, but is written in a
way that can cause problems later.

It is usually **not an actual bug**.

### Simple example

``` ts
function calculate(a: number, b: number, c: number, d: number, e: number) {
  // lots of complicated logic
}
```

The code may work, but having a function with too many parameters can
make it harder to understand and maintain.

SonarCloud may report this as a **code smell**.

Another example:

``` ts
if (user) {
  if (user.address) {
    if (user.address.city) {
      console.log(user.address.city);
    }
  }
}
```

This may work, but deeply nested code can become difficult to maintain.

SonarCloud helps developers identify these patterns.

### Important distinction

  Finding         Simple meaning
  --------------- -------------------------------------------
  Bug             The code may behave incorrectly
  Vulnerability   Security weakness that could be exploited
  Code Smell      Code that is difficult/risky to maintain
  Coverage        How much code is tested
  Duplication     Similar/repeated code

------------------------------------------------------------------------

# 3. Why does SonarCloud help with Code Quality?

Imagine a team has 20 developers.

Everyone writes code differently.

Without an automated quality check:

``` text
Developer
   ↓
Writes code
   ↓
Code Review
   ↓
Maybe reviewer notices problems
   ↓
Merge
```

With SonarCloud:

``` text
Developer
   ↓
Writes code
   ↓
Tests + Coverage
   ↓
SonarCloud
   ↓
Checks quality
   ↓
Reports problems
   ↓
Developer fixes them
```

This gives the team a **consistent automated quality check**.

It is especially useful in CI/CD because every pull request can be
checked automatically.

------------------------------------------------------------------------

# 4. What SonarCloud checks

SonarCloud mainly helps us understand these areas:

## Security

Looks for security-related problems.

Example:

``` ts
element.innerHTML = userInput;
```

Potentially unsafe handling of user-controlled input can be flagged.

Your current project shows:

**Security: A --- 0 open issues**

That is good.

------------------------------------------------------------------------

## Reliability

Reliability is about code that could potentially cause incorrect
behavior or failures.

Your project currently shows:

**Reliability: C --- 11 open issues**

This means SonarCloud has identified 11 reliability-related issues that
you should review.

------------------------------------------------------------------------

## Maintainability

Maintainability means:

> How easy will this code be to understand and change in the future?

SonarCloud uses **code smells** heavily in this area.

Your project currently shows:

**Maintainability: A --- 61 open issues**

The `A` rating is the rating, while `61 open issues` is the number of
findings.

So don't confuse:

``` text
A = rating
61 = number of issues
```

------------------------------------------------------------------------

# 5. Code Coverage

Coverage answers a simple question:

> How much of my code is executed by automated tests?

Your project currently has:

**94.7% coverage**

For example:

``` ts
function add(a: number, b: number) {
  return a + b;
}
```

If your test does:

``` ts
expect(add(2, 3)).toBe(5);
```

then the function is executed by the test.

Higher coverage generally gives more confidence that your code is being
tested.

But:

> 100% coverage does NOT automatically mean 100% bug-free code.

Good tests matter more than simply chasing a percentage.

------------------------------------------------------------------------

# 6. Duplication

Duplication means similar code exists in multiple places.

Example:

``` ts
function getUser() {
  // same logic
}

function getAdmin() {
  // almost the same logic
}
```

If the same logic is repeated many times, changing it later becomes
harder.

Your project currently shows:

**2.8% duplication**

That is the percentage of duplicated code detected by SonarCloud.

------------------------------------------------------------------------

# 7. Understanding your `sonar-project.properties`

Your file:

``` properties
sonar.projectKey=mkv-mkverma_Angular-22-machine-coding
sonar.projectName=Angular-22-machine-coding
sonar.organization=mkv-mkverma

sonar.sourceEncoding=UTF-8

sonar.sources=src
sonar.exclusions=**/node_modules/**,**/*.spec.ts

sonar.tests=src
sonar.test.inclusions=**/*.spec.ts

sonar.javascript.lcov.reportPaths=coverage/Angular-22-machine-coding/lcov.info
```

Let's understand each line simply.

------------------------------------------------------------------------

## `sonar.projectKey`

``` properties
sonar.projectKey=mkv-mkverma_Angular-22-machine-coding
```

This is the **unique ID of your SonarCloud project**.

Think:

``` text
SonarCloud
   ↓
Which project?
   ↓
mkv-mkverma_Angular-22-machine-coding
```

------------------------------------------------------------------------

## `sonar.projectName`

``` properties
sonar.projectName=Angular-22-machine-coding
```

This is the **display name** of your project in SonarCloud.

------------------------------------------------------------------------

## `sonar.organization`

``` properties
sonar.organization=mkv-mkverma
```

This tells SonarCloud:

> Which organization owns this project?

------------------------------------------------------------------------

## `sonar.sourceEncoding`

``` properties
sonar.sourceEncoding=UTF-8
```

This tells SonarCloud that the source files use UTF-8 encoding.

For example, it allows source code containing characters such as:

``` text
₹
é
中文
```

to be interpreted correctly.

------------------------------------------------------------------------

# 8. `sonar.sources`

``` properties
sonar.sources=src
```

This tells SonarCloud:

> Analyze the source code inside the `src` folder.

For an Angular application, that usually means your application code.

------------------------------------------------------------------------

# 9. `sonar.exclusions`

``` properties
sonar.exclusions=**/node_modules/**,**/*.spec.ts
```

This tells SonarCloud:

> Do not analyze these files as normal source code.

You are excluding:

### `node_modules`

``` text
**/node_modules/**
```

Because these are third-party dependencies and not your application
code.

### Test files

``` text
**/*.spec.ts
```

Because test files are handled separately using:

``` properties
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts
```

------------------------------------------------------------------------

# 10. `sonar.tests`

``` properties
sonar.tests=src
```

This tells SonarCloud:

> Tests are located inside the `src` folder.

------------------------------------------------------------------------

# 11. `sonar.test.inclusions`

``` properties
sonar.test.inclusions=**/*.spec.ts
```

This tells SonarCloud:

> Treat `.spec.ts` files as test files.

For example:

``` text
src/app/app.component.spec.ts
src/app/services/user.service.spec.ts
```

are recognized as tests.

------------------------------------------------------------------------

# 12. LCOV coverage report

``` properties
sonar.javascript.lcov.reportPaths=coverage/Angular-22-machine-coding/lcov.info
```

This is very important.

Your test command generates a coverage report:

``` text
npm run test:coverage
        ↓
coverage/
        ↓
lcov.info
```

SonarCloud reads that `lcov.info` file to understand your test coverage.

The flow is:

``` text
Angular tests
     ↓
Coverage generated
     ↓
lcov.info
     ↓
SonarCloud reads it
     ↓
Coverage shown in SonarCloud
```

That is why your SonarCloud page can show:

``` text
94.7% Coverage
```

------------------------------------------------------------------------

# 13. Understanding your GitHub Actions workflow

Your workflow:

``` yaml
name: SonarCloud Scan

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  sonar:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: SonarCloud Scan
        uses: SonarSource/sonarqube-scan-action@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

Think of it as an automated pipeline.

------------------------------------------------------------------------

# 14. Pipeline flow

Your pipeline basically does this:

``` text
GitHub
   │
   ├── Code pushed to main
   │
   └── Pull Request created/updated
             │
             ▼
       GitHub Actions
             │
             ▼
      Checkout code
             │
             ▼
       Install Node 22
             │
             ▼
        npm ci
             │
             ▼
   Run tests + coverage
             │
             ▼
        lcov.info
             │
             ▼
       SonarCloud
             │
             ▼
   Analyze source code
             │
             ├── Bugs
             ├── Code smells
             ├── Security
             ├── Coverage
             └── Duplication
```

------------------------------------------------------------------------

# 15. Why `fetch-depth: 0`?

``` yaml
with:
  fetch-depth: 0
```

This tells GitHub Actions to fetch the **full Git history** instead of
only the latest commit.

SonarCloud can use Git history for better analysis and
pull-request/change information.

For an interview, you can simply say:

> "`fetch-depth: 0` gives SonarCloud access to the complete Git history,
> which helps with SCM and pull-request analysis."

------------------------------------------------------------------------

# 16. Why `npm ci`?

``` yaml
run: npm ci
```

`npm ci` installs dependencies from the lock file.

It is commonly preferred in CI/CD because it gives a clean, reproducible
installation.

Simple explanation:

``` text
package-lock.json
       ↓
     npm ci
       ↓
Same dependency versions
```

------------------------------------------------------------------------

# 17. Why run tests before SonarCloud?

``` yaml
- name: Run tests with coverage
  run: npm run test:coverage
```

Because SonarCloud needs the coverage report.

The important sequence is:

``` text
Run tests
   ↓
Generate coverage
   ↓
Generate lcov.info
   ↓
SonarCloud reads lcov.info
```

If the coverage file is not generated, SonarCloud cannot use that
report.

------------------------------------------------------------------------

# 18. What are `GITHUB_TOKEN` and `SONAR_TOKEN`?

``` yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### `GITHUB_TOKEN`

GitHub provides this token to GitHub Actions.

It allows the workflow to interact with the GitHub repository where
permitted.

### `SONAR_TOKEN`

This is the authentication token used by the workflow to communicate
with your SonarCloud project.

It is stored as a GitHub Secret rather than putting the actual token
inside your source code.

Never commit the actual token into Git.

------------------------------------------------------------------------

# 19. What happens when I create a Pull Request?

Suppose you change:

``` ts
user.service.ts
```

and create a PR.

GitHub Actions runs:

``` text
PR
 ↓
Install dependencies
 ↓
Run tests
 ↓
Generate coverage
 ↓
SonarCloud analysis
 ↓
Report findings
```

Now the team can review quality problems **before merging the code**.

This is one of the biggest benefits of SonarCloud.

------------------------------------------------------------------------

# 20. What is a Quality Gate?

A **Quality Gate** is basically a set of rules that determines:

> "Is this code good enough to pass?"

For example, a team could define rules such as:

``` text
New code coverage >= 80%
No new critical bugs
No new vulnerabilities
Limited duplication
```

Then:

``` text
Code
 ↓
SonarCloud analysis
 ↓
Quality Gate
 ↓
PASS / FAIL
```

This can be used in a CI/CD process to prevent poor-quality code from
being merged or released, depending on how the team configures the
pipeline.

------------------------------------------------------------------------

# 21. Simple real-world example

Imagine a developer writes:

``` ts
if (user) {
  if (user.profile) {
    if (user.profile.address) {
      if (user.profile.address.city) {
        return user.profile.address.city;
      }
    }
  }
}
```

The code may work.

But SonarCloud may say:

> This code can be simplified.

The developer can refactor it:

``` ts
return user?.profile?.address?.city;
```

Now the code is:

-   Easier to read
-   Shorter
-   Easier to maintain

This is the type of improvement SonarCloud encourages.

------------------------------------------------------------------------

# 22. SonarCloud does NOT replace code review

SonarCloud is an automated helper.

It does not understand the complete business requirement like a
developer does.

A good process is:

``` text
Developer
   ↓
Writes code
   ↓
Unit tests
   ↓
SonarCloud
   ↓
Code review
   ↓
Merge
```

Think of SonarCloud as:

> **An automated code-quality assistant, not a replacement for
> developers.**

------------------------------------------------------------------------

# 23. Your current project

From your current SonarCloud dashboard:

  Metric                     Current result
  ------------------------ ----------------
  Security                                A
  Security issues                         0
  Reliability                             C
  Reliability issues                     11
  Maintainability                         A
  Maintainability issues                 61
  Coverage                            94.7%
  Duplication                          2.8%

The next useful step is **not blindly fixing all 72 issues**.

Instead:

1.  Open **Issues**
2.  Look at the 11 Reliability issues
3.  Understand why each issue was reported
4.  Fix a few
5.  Run the pipeline again
6.  Check how the dashboard changes

That is how you will actually learn SonarCloud.

------------------------------------------------------------------------

# 24. Interview explanation

If an interviewer asks:

### "Have you worked with SonarCloud?"

You can say:

> "Yes. I recently integrated SonarCloud with an Angular project using
> GitHub Actions. I configured the project using
> `sonar-project.properties`, including source files, test files,
> exclusions and the LCOV coverage report. In GitHub Actions, I run the
> tests with coverage first and then trigger the SonarCloud scan.
> SonarCloud then analyzes the code for bugs, code smells, security
> issues, duplication and test coverage."

If they ask:

### "What is a code smell?"

Say:

> "A code smell is an indication that code may be difficult to maintain
> or understand. It may not be a bug, but it suggests the code can be
> improved."

If they ask:

### "Why use SonarCloud?"

Say:

> "It gives the team an automated and consistent way to identify
> code-quality, reliability, maintainability and security issues,
> especially as part of CI/CD and pull-request checks."

------------------------------------------------------------------------

# 25. The most important thing to remember

You don't need to memorize SonarCloud.

Remember this:

``` text
SonarCloud
    ↓
Analyzes code
    ↓
Finds potential problems
    ↓
Bugs
Code smells
Security issues
Duplication
Coverage
    ↓
Developer fixes problems
    ↓
Better maintainable code
```

And your GitHub Actions does:

``` text
Code
 ↓
npm ci
 ↓
Tests + Coverage
 ↓
SonarCloud Scan
 ↓
Quality Report
```

That's the core concept.
