# Cross-Browser Failure — Quick Flow

## 1. Detect → Reproduce → Diagnose

```text
Chrome works
    ↓
Safari fails
    ↓
Reproduce in Safari
    ↓
DevTools: Console + Network + Performance
    ↓
Identify root cause
    ↓
JS/API | CSS | 3rd-party library
    ↓
Fix → Test → Regression test → Release
```

## 2. JavaScript / Web API → Polyfill

Use a polyfill when the browser does not support a runtime API.

Install:

```bash
npm install core-js
```

`src/polyfills.ts`:

```ts
import 'core-js/es/array/find-last';
```

`src/main.ts`:

```ts
import './polyfills';
```

Example:

```ts
const result = users.findLast(u => u.active);
```

**Remember:**
- `tsconfig "lib": ["ES2023"]` → TypeScript knows the API.
- `core-js` polyfill → browser can run the API.
- First confirm the actual unsupported API; don't blindly add polyfills.

## 3. CSS → `@supports` / fallback

Prefer standard CSS first. If a feature needs a fallback:

```css
.container {
  display: flex;
}

@supports (gap: 16px) {
  .container {
    gap: 16px;
  }
}
```

Use `@supports` to detect CSS feature support rather than assuming the browser.

For Safari-specific behavior, use a targeted workaround only when required and tested.

## 4. Third-Party Library

If the Safari stack trace points to a library:

```text
Angular app
    ↓
Third-party library
    ↓
Safari error
```

Check:
- Is the library version compatible?
- Known Safari issue?
- Newer version available?
- Configuration/fallback available?

Then **upgrade / configure / replace** rather than immediately patching application code.

## 5. Browser DevTools

### Safari
Use Safari → Develop → Show Web Inspector.

Check:
- **Console** → errors + stack trace
- **Network** → API status, timing, payload
- **Elements/Styles** → CSS/layout
- **Performance** → slow rendering / scripting
- **Storage** → cookies, localStorage, IndexedDB

### Chrome / Firefox
Use the same categories in DevTools to compare behavior.

## 6. BrowserStack

Use BrowserStack when you need to test combinations you don't have locally:

```text
BrowserStack
   ↓
Safari versions / macOS
Chrome / Firefox / Edge
Mobile Safari / Chrome
   ↓
Reproduce + compare
```

Use it to validate:
- browser/version compatibility
- responsive layouts
- JavaScript behavior
- CSS behavior
- real-device/mobile issues

## Interview One-Liner

> "I reproduce the issue, use browser DevTools to identify the exact failure, classify it as JS/API, CSS, or third-party, verify browser compatibility, apply the smallest appropriate fix, validate across supported browsers using local DevTools and BrowserStack, then add regression coverage."
