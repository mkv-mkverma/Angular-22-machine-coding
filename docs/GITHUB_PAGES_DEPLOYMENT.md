# Angular 22 Deployment to GitHub Pages using GitHub Actions

## Project URL Pattern

```
https://<username>.github.io/<repository-name>/
```

---

# Step-by-Step Deployment

## 1. Create Angular Project

```bash
ng new Angular-22-machine-coding
```

---

## 2. Push to GitHub

```bash
git init

git add .

git commit -m "Initial Commit"

git branch -M main

git remote add origin <repo-url>

git push -u origin main
```

---

## 3. Verify Build

Run

```bash
ng build
```

Verify output

```
dist/
└── Angular-22-machine-coding/
    └── browser/
```

---

## 4. Enable GitHub Actions

```
Repository

↓

Settings

↓

Actions

↓

General

↓

Allow all actions and reusable workflows
```

---

## 5. Enable GitHub Pages

```
Repository

↓

Settings

↓

Pages

↓

Build and deployment

↓

GitHub Actions
```

---

## 6. Create Workflow

Create

```
.github/

└── workflows/

      deploy.yml
```

---

## 7. Workflow

Workflow responsibilities

- Checkout repository
- Setup Node.js
- Install dependencies
- Build Angular
- Upload browser folder
- Deploy to GitHub Pages

---

## 8. Commit Workflow

```bash
git add .

git commit -m "Add GitHub Pages deployment"

git push origin main
```

---

## 9. Automatic Deployment

Every push to **main** automatically

```
Checkout

↓

npm ci

↓

ng build

↓

Upload browser folder

↓

GitHub Pages Deployment
```

---

## 10. Live Site

```
https://<username>.github.io/<repository-name>/
```

---

# Important Notes

### Use base-href

```bash
ng build --base-href="/<repository-name>/"
```

Without it Angular won't load CSS or JS correctly.

---

### Don't Commit dist

Never commit

```
dist/
```

GitHub Actions generates it automatically.

---

### Angular 22 Output

```
dist/

└── Angular-22-machine-coding/

        browser/
```

Deploy only

```
browser/
```

---

### GitHub Actions

Every push automatically

- Builds
- Deploys
- Updates website

---

# CI/CD Flow

```
Developer

│

git push

│

▼

GitHub Repository

│

▼

GitHub Actions

│

├── Checkout Code

├── npm ci

├── ng build

├── Upload browser folder

▼

GitHub Pages

│

▼

Live Website
```

---

# Interview Questions

## What is GitHub Pages?

GitHub Pages is a static website hosting service provided by GitHub.

---

## Why use GitHub Pages?

- Free
- HTTPS
- Easy deployment
- Portfolio hosting
- Documentation hosting

---

## Why use GitHub Actions?

Automates build and deployment.

---

## Why base-href?

GitHub Pages hosts your application inside

```
/repository-name/
```

Angular must know this path.

---

## Why don't we commit dist?

Because it is generated every build.

---

## What folder gets deployed?

```
dist/<project-name>/browser
```

---

## Advantages

- Free Hosting
- Automatic Deployment
- CI/CD
- Version Controlled
- Great for Portfolio Projects

# GitHub Actions & GitHub Pages Interview Questions

## 1. What is GitHub Actions?

**Answer:**

GitHub Actions is GitHub's built-in **CI/CD (Continuous Integration and Continuous Delivery/Deployment)** platform.

It allows you to automate tasks such as:

- Building applications
- Running tests
- Deploying applications
- Running scripts
- Sending notifications

A workflow is triggered by events like:

- Push
- Pull Request
- Release
- Schedule (Cron)

---

## 2. Why use CI/CD?

**Answer:**

CI/CD automates the software delivery process.

### Continuous Integration (CI)

Every code change is automatically:

- Checked out
- Built
- Tested
- Validated

This helps detect issues early.

### Continuous Delivery/Deployment (CD)

After a successful build, the application is automatically deployed to the target environment.

Benefits:

- Faster releases
- Reduced manual work
- Fewer deployment errors
- Consistent deployments

---

## 3. What happens after `git push`?

**Answer:**

When you push code to GitHub:

```
git push

↓

GitHub Repository

↓

GitHub detects push event

↓

GitHub Actions Workflow starts

↓

Checkout source code

↓

Install Node.js

↓

Install dependencies (npm ci)

↓

Build Angular application

↓

Create dist folder

↓

Upload browser folder

↓

Deploy to GitHub Pages

↓

Website Updated
```

No manual deployment is required.

---

## 4. Why is `base-href` required for GitHub Pages?

**Answer:**

GitHub Pages hosts the application under the repository name.

Example:

```
https://username.github.io/repository-name/
```

Angular needs to know this base path so it can correctly load:

- JavaScript files
- CSS files
- Images
- Assets

Example:

```bash
ng build --base-href="/Angular-22-machine-coding/"
```

Without `base-href`, the browser tries to load files from:

```
https://username.github.io/main.js
```

instead of

```
https://username.github.io/Angular-22-machine-coding/main.js
```

---

## 5. Why shouldn't you commit the `dist/` folder?

**Answer:**

The `dist/` folder contains generated build files.

Reasons not to commit it:

- Generated automatically
- Increases repository size
- May become outdated
- Causes unnecessary merge conflicts

Instead, GitHub Actions generates it during every deployment.

Only commit the source code.

---

## 6. What is the purpose of `actions/checkout`?

**Answer:**

`actions/checkout` downloads the repository code into the GitHub Actions runner.

Example:

```yaml
- uses: actions/checkout@v4
```

Without this action, the workflow has no access to your source code.

---

## 7. What does `actions/setup-node` do?

**Answer:**

It installs the required Node.js version on the GitHub runner.

Example:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
```

Benefits:

- Installs the correct Node version
- Supports npm caching
- Provides a consistent build environment

---

## 8. Why do we use `npm ci` instead of `npm install` in CI?

**Answer:**

`npm ci` is specifically designed for Continuous Integration environments.

Advantages:

- Faster installation
- Uses `package-lock.json`
- Produces reproducible builds
- Removes existing `node_modules` before installing

Comparison:

| npm install | npm ci |
|--------------|---------|
| Slower | Faster |
| Updates package-lock.json | Never updates package-lock.json |
| Used during development | Used in CI/CD |
| May install newer compatible versions | Installs exact locked versions |

---

## 9. Why do we upload the `browser` folder?

**Answer:**

Angular 22's application builder generates the deployable files inside:

```
dist/
└── Angular-22-machine-coding/
    └── browser/
```

The `browser` folder contains:

- index.html
- JavaScript bundles
- CSS
- Assets

GitHub Pages only needs these static files.

Example:

```yaml
path: dist/Angular-22-machine-coding/browser
```

---

## 10. How would you deploy the same Angular app to AWS S3 + CloudFront instead of GitHub Pages?

**Answer:**

Enterprise deployment flow:

```
Developer

│

git push

│

▼

GitHub Actions

│

npm ci

│

ng build

│

dist/

│

aws s3 sync

│

Amazon S3 Bucket

│

CloudFront CDN

│

Internet

│

Users
```

Typical AWS services used:

- Amazon S3 – Stores static website files
- CloudFront – Global CDN for fast delivery
- IAM – Permissions and security
- Route 53 – DNS management
- ACM – Free SSL certificates

Deployment steps:

1. Build Angular application.

```bash
ng build --configuration production
```

2. Upload build output to S3.

```bash
aws s3 sync dist/Angular-22-machine-coding/browser s3://my-angular-app
```

3. CloudFront serves the S3 bucket.

4. Route 53 maps the custom domain.

5. ACM provides HTTPS certificates.

This architecture is commonly used in enterprise frontend applications.

---

# Summary

## GitHub Pages Deployment

```
Developer

↓

git push

↓

GitHub Actions

↓

npm ci

↓

ng build

↓

Upload browser folder

↓

GitHub Pages

↓

Live Website
```

## AWS Deployment

```
Developer

↓

git push

↓

GitHub Actions

↓

ng build

↓

Amazon S3

↓

CloudFront

↓

Users
```