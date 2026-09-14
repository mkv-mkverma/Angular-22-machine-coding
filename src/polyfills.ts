// npm install core-js
// npm ls core-js
// import 'core-js/es/array/find-last';

// add polyfills in main.ts
// import './polyfills';

// import './custom-polyfills';

// add in tsconfig.app.json

// "compilerOptions": {
//     "types": [],
//     "target": "ES2022",
//     "lib": ["ES2023", "DOM"]
//   },

// add in tsconfig.app.json

// if (!Array.prototype.findLast) {
//   Array.prototype.findLast = function <T>(
//     callback: (value: T, index: number, array: T[]) => boolean,
//   ): T | undefined {
//     for (let i = this.length - 1; i >= 0; i--) {
//       if (callback(this[i], i, this)) {
//         return this[i];
//       }
//     }

//     return undefined;
//   };
// }
