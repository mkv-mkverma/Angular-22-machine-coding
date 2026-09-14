# TypeScript — Interview Notes

## 1. `type` vs `interface`

```ts
// interface
interface User {
  name: string;
}
interface User {
  age: number;
} // declaration merging -> p: User = { name: '', age: '' }

interface UserNew extends User {
  address: string;
}
// extends
const p: UserNew = { name: "", age: 9, address: "" };
```

```ts
// type
type Person = {
  name: string;
}; // object shape
type PersonNew = Person & { age: number }; // intersection

type Name = string; // alias type
type Status = "Success" | "fail"; // union
type Emp = [string, number, ...boolean[]]; // tuple
```

## 2. Union / Intersection

```ts
let id: number | string; // union
type Status = "Success" | "fail"; // union

type PersonNew = Person & { age: number }; // intersection
```

## 3. Difference between `any`, `unknown` and `never`

- **any** → disables type checking and affects tree shaking
- **unknown** → can store any value, but you must check its type before using it
- **never** → nothing can exist here, e.g. `throw new Error()`

## 4. Generics

Generics allow us to create reusable and type-safe components, functions, interfaces, or classes that can work with different types. We define a type parameter such as `T`, and the actual type is provided when the function or component is used. Unlike `any`, generics preserve type information and provide compile-time type safety.

```ts
interface APIResponse<T> {
  data: T;
  loading: boolean;
}

interface User {
  name: string;
}

function getData(): APIResponse<User> {
  return {
    data: { name: "Manish" },
    loading: false,
  };
}

function getFirst<T>(items: T[]): T {
  return items[0];
}

const number = getFirst([1, 2, 3]);
const name = getFirst(["John", "Mike"]);

function display<T>(value: T): T {
  console.log(value);
  return value;
}

display<string>("Hello");
```

## 5. Utility Types

Transform existing types — so I don't rewrite interfaces again and again.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}
```

**`Partial<T>`** — use case: update API, send only changed fields.

```ts
type UserPartial = Partial<User>;

function updateUser(id: number, changes: UserPartial) {}

updateUser(1, { name: "Manish" }); // ✅ only name
updateUser(1, { email: "m@gmail.com" }); // ✅ only email
// No need to send all fields
```

**`Required<T>`** — every field must be present.

```ts
const newUser: Required<User> = {
  id: 1,
  name: "Manish",
  email: "m@gmail.com",
  password: "1234", // ❌ Error if missing
};
```

**`Pick<T, K>`** — show user in UI, don't expose password.

```ts
type UserProfile = Pick<User, "id" | "name" | "email">;

const profile: UserProfile = {
  id: 1,
  name: "Manish",
  email: "m@gmail.com",
  // password not here ✅
};
```

**`Omit<T, K>`** — everything except password.

```ts
type SafeUser = Omit<User, "password">;

const safeUser: SafeUser = {
  id: 1,
  name: "Manish",
  email: "m@gmail.com",
  // password removed ✅
};
```

**`Readonly<T>`**

```ts
const user: Readonly<User> = {
  id: 1,
  name: "Manish",
  email: "m@gmail.com",
  password: "1234",
};

user.name = "Kumar"; // ❌ Error — cannot assign to readonly
```

**`Record<K, T>`** — map role to permissions.

```ts
type Role = "admin" | "editor" | "viewer";

const permissions: Record<Role, string[]> = {
  admin: ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"],
};
```

## 6. `keyof`

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKeys = keyof User;
// UserKeys = "id" | "name" | "email"

function getValueA(user: User, key: keyof User) {
  return user[key];
}

function getValue<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```

## 7. Type Narrowing

Broad type → check → specific type.

```ts
function print(value: string | number) {
  // value is string | number here

  if (typeof value === "string") {
    // value is string here
    console.log(value.toUpperCase());
  } else {
    // value is number here
    console.log(value.toFixed(2));
  }
}

interface User {
  name: string;
}

interface Admin {
  permissions: string[];
}
```

Narrowing techniques:

- `typeof`
- Equality check `===`
- `instanceof` — e.g. `value instanceof Date` where `value: Date | String`
- `in` — e.g. `"permissions" in user`

## 8. How should you design a type-safe API response model?

I design one generic `ApiResponse<T>` wrapper. Every API call returns the same shape — only `data` changes.

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

// Single object
type UserResponse = ApiResponse<User>;

// List
type UserListResponse = ApiResponse<User[]>;

// Paginated
interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

type UserPageResponse = ApiResponse<Paginated<User>>;
```

## 9. Type Guards

Type guards narrow union types at runtime. I use `typeof` for primitives, `instanceof` for classes, `in` for object shapes, and custom `is` guards for API responses. Without them, TypeScript can't know which type in a union I'm actually using.

## 10. `typeof`

```ts
const val = "hello";
console.log(typeof val); // "string" — at runtime, JS
```

```ts
const user = {
  id: 1,
  name: "Manish",
  email: "m@gmail.com",
};

// Don't write interface manually — extract it from the object
type UserType = typeof user;
// { id: number; name: string; email: string; }

const config = {
  apiUrl: "https://api.example.com",
  timeout: 3000,
  retries: 3,
};

type Config = typeof config;
// { apiUrl: string; timeout: number; retries: number; }

function init(cfg: Config) {} // reuse the type
```

I use `typeof` to extract a type from a value — so I don't duplicate code.

```ts
const user = { id: 1, name: "Manish", email: "m@gmail.com" };

type UserKeys = keyof typeof user;
// "id" | "name" | "email"

interface User {
  name: string;
  email: string;
  password: string;
}

// Generate form dirty state from User model
type FormDirty<T> = {
  [K in keyof T]: boolean;
};

type UserFormDirty = FormDirty<User>;
// { name: boolean; email: boolean; password: boolean; }
```

## 11. Mapped Types

_(TODO)_

## 12. Conditional Types

_(TODO)_
