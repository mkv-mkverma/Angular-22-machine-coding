# JSON Server Setup

`json-server` creates a small local REST API from a JSON file. It is useful while developing the Angular app when the real backend is not available yet.

## 1. Install JSON Server

From the project root, install it as a development dependency:

```bash
npm install --save-dev json-server
```

This adds JSON Server to `devDependencies`, so everyone working on the project gets the same local mock-API tool after running `npm install`.

## 2. Create the mock data file

Create `src/assets/db.json` with the following content:

```json
{
  "users": [
    {
      "id": 1,
      "name": "Manish",
      "email": "manish@example.com"
    },
    {
      "id": 2,
      "name": "Rahul",
      "email": "rahul@example.com"
    }
  ],
  "products": [
    {
      "id": 1,
      "name": "Laptop",
      "price": 50000
    }
  ]
}
```

Each top-level key becomes an API resource. In this example, `users` and `products` become endpoints.

## 3. Run the mock API

```bash
npx json-server src/assets/db.json
```

`npx` runs the locally installed `json-server` command without requiring a global installation. The command reads `src/assets/db.json`, starts a server (normally on port `3000`), and exposes its top-level collections as REST endpoints.

For the sample data, use:

```text
GET http://localhost:3000/users
GET http://localhost:3000/products
```

> Endpoint names are case-sensitive: use `/users`, not `/Users`.

You can also retrieve one record, for example `GET http://localhost:3000/users/1`.

## 4. Add npm scripts (recommended)

Add these entries to the `scripts` section of `package.json`:

```json
{
  "scripts": {
    "start": "ng serve",
    "mock-api": "json-server src/assets/db.json"
  }
}
```

Keep the project's existing scripts (such as `build` and `test`); only add `mock-api`. Then start the Angular application and mock API in separate terminals:

```bash
npm start
npm run mock-api
```

`ng s` is a shorthand for `ng serve`; `npm start` runs the existing `start` script and is generally easier to share in project instructions.

## 5. Run both servers with one command (optional)

Install `concurrently`:

```bash
npm install --save-dev concurrently
```

Then add the `dev` script:

```json
{
  "scripts": {
    "start": "ng serve",
    "mock-api": "json-server src/assets/db.json",
    "dev": "concurrently \"npm:start\" \"npm:mock-api\""
  }
}
```

Run both services together:

```bash
npm run dev
```

Angular will normally run at `http://localhost:4200`, while JSON Server runs at `http://localhost:3000`.

## Command summary

```text
npm install --save-dev json-server  -> installs JSON Server locally
npx json-server src/assets/db.json  -> starts the JSON Server mock API
npm run mock-api                    -> starts it through package.json
npm run dev                         -> starts Angular and the mock API together
```
