# Angular 22 Machine Coding

Angular 22 interview practice project.

## Live Demo

https://mkv-mkverma.github.io/Angular-22-machine-coding/

## Topics Covered

- RxJS
- Signals
- Resource API
- Machine Coding
- Angular 22
- GitHub Actions
- GitHub Pages

## Documentation

- 📘 GitHub Pages Deployment
- 📘 GitHub Actions Guide
- 📘 AWS S3 Deployment
- 📘 Interview Questions

## Run Project

```bash
npm install
ng serve
```

## Build

```bash
ng build
```

## Code Quality and Pre-commit Checks

This project uses ESLint and Husky to catch common issues before code is committed.

### One-time setup

```bash
npm install --save-dev husky
npx husky init
ng add angular-eslint
```

- `husky` lets the repository run scripts during Git actions, such as `git commit`.
- `npx husky init` creates the `.husky/pre-commit` hook and adds the `prepare` script so hooks are installed after `npm install`.
- `ng add angular-eslint` configures Angular ESLint and adds the `ng lint` command.

### What happens on commit

The `.husky/pre-commit` hook runs:

```bash
npm run lint
npm test
```

The commit is stopped if linting or tests fail. This prevents avoidable problems—such as unused imports, unsafe types, formatting issues caught by ESLint, or a broken unit test—from entering the Git history.

`npm test` runs once with `ng test --watch=false`, so Git can continue after the checks complete. While developing, use `npm run test:watch` to rerun tests whenever files change.

### Fix lint issues automatically

```bash
npx ng lint --fix
```

This fixes rules ESLint can safely correct automatically. Review the changes and resolve any remaining lint errors before committing.
