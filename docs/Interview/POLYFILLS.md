# Adding Polyfills

Notes on the two ways to polyfill a missing JS API in this project, based on `src/polyfills.ts`.

## Option 1: Library polyfill (e.g. `core-js`)

1. Install the library:
   ```bash
   npm install core-js
   ```
2. Import the specific polyfill needed (avoid importing all of `core-js`):
   ```ts
   // src/polyfills.ts
   import 'core-js/es/array/find-last';
   ```
3. Import `./polyfills` at the top of `src/main.ts`, before `bootstrapApplication`:
   ```ts
   import './polyfills';

   import { bootstrapApplication } from '@angular/platform-browser';
   ```

## Option 2: Raise the TS target/lib

If the only issue is TypeScript not recognizing a newer API that the runtime already supports, bump the compiler target/lib in `tsconfig.app.json` instead of shipping a polyfill:

```json
{
  "compilerOptions": {
    "types": [],
    "target": "ES2022",
    "lib": ["ES2023", "DOM"]
  }
}
```

## Option 3: Custom polyfill

For a small, one-off API gap, write a manual feature-detected polyfill (e.g. in `src/custom-polyfills.ts`) and import it from `src/main.ts` the same way as Option 1:

```ts
if (!Array.prototype.findLast) {
  Array.prototype.findLast = function <T>(
    callback: (value: T, index: number, array: T[]) => boolean,
  ): T | undefined {
    for (let i = this.length - 1; i >= 0; i--) {
      if (callback(this[i], i, this)) {
        return this[i];
      }
    }

    return undefined;
  };
}
```

Import it in `src/main.ts`:
```ts
import './custom-polyfills';
```
