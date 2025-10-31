# Next.js Public Runtime Environment

`next-public-env` is a lightweight utility that dynamically injects environment
variables into your Next.js application at *runtime* instead of just at build time.

## The Problem

Next.js's standard approach bakes environment variables into your application
during the build process through `NEXT_PUBLIC_` variables. This means you need a
separate build for each environment; one for development, another for staging,
and yet another for production. This violates the "build once, deploy many"
principle and creates unnecessary complexity in your deployment pipeline.

## Features

- **Type Safety & Validation:** Integrates with Zod for schema validation, type
  coercion, and full TypeScript support.
- **Error-Resilient:** Environment variables remain accessible even when pages
  throw unhandled errors.
- **Universal API:** Use the same `getPublicEnv()` function in both Server and
  Client Components.
- **Lightweight:** Adds only ~275 bytes to your client bundle.

## Installation

Install it via your preferred package manager:

```bash
yarn add next-public-env
```
```bash
pnpm add next-public-env
```
```bash
npm install next-public-env
```

## Getting Started

### 1. Define Your Environment Config

Create a file to configure your public environment variables (e.g.,
`public-env.ts`).

**Basic (Type-Safe):**
```ts
// public-env.ts
import { createPublicEnv } from 'next-public-env';

export const { getPublicEnv, PublicEnv } = createPublicEnv({
  NODE_ENV: process.env.NODE_ENV,
  API_URL: process.env.API_URL,
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === 'true',
});
```

**With Zod Validation (Recommended):**
```ts
// public-env.ts
import { createPublicEnv } from 'next-public-env';

export const { getPublicEnv, PublicEnv } = createPublicEnv(
  {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    PORT: process.env.PORT,
  },
  {
    schema: (z) => ({
      NODE_ENV: z.enum(['development', 'production', 'test']),
      API_URL: z.string().url(),
      MAINTENANCE_MODE: z.enum(['on', 'off']).default('off'),
      PORT: z.coerce.number().default(3000), // Converts string to number
    }),
  }
);
```

### 2. Add to Root Layout

Place `<PublicEnv />` in your root layout to make variables available
client-side:

```tsx
// app/layout.tsx
import { PublicEnv } from './public-env';

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
    <html lang="en">
      <body>
        <PublicEnv />
        {children}
      </body>
    </html>
  );
}
```

### 3. Use Anywhere

Access your environment variables with full type safety:

```tsx
// Server Component
import { getPublicEnv } from './public-env';

export default function ServerPage() {
  const env = getPublicEnv();
  return <div>API URL: {env.API_URL}</div>;
}

// Client Component
'use client';
import { getPublicEnv } from './public-env';

export function ClientComponent() {
  const env = getPublicEnv();
  return <div>API URL: {env.API_URL}</div>;
}
```

## Rendering Behavior

### Default: Dynamic Rendering

When you use `getPublicEnv()` in a Server Component, that route automatically
switches to **dynamic rendering**. This ensures your environment variables are
always read fresh from the server at request time, rather than being cached at
build time.

### Advanced: Manual Rendering Control

For specific use cases, you can override this behavior using the
`dynamicRendering` option. Set it to `'manual'` to disable the automatic
`noStore()` call and take full control of your routes' rendering behavior.


## API Reference

### `createPublicEnv(publicEnv, options)`

This is the main function used to configure the library.

#### **Parameters**

| Parameter   | Type     | Required? | Description                                                                                                                                                        |
| :---------- | :------- | :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `publicEnv` | `object` | Yes       | An object that explicitly defines the variables and values to be made available. This acts as an allowlist, ensuring no other `process.env` variables are exposed. |
| `options`   | `object` | No        | An optional object for advanced configuration like schema validation and rendering behavior.                                                                       |

#### **Options Object Properties**

| Property              | Type                      | Description                                                                                                                                                                                                                                                                                                                |
| :-------------------- | :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema`              | `(z) => ZodObject`        | An optional function that receives the Zod library (`z`) as an argument and returns a Zod schema object. The keys in the schema must match the keys in your `publicEnv` object. Used for validation, type coercion, and setting defaults.                                                                                  |
| `validateAtBuildStep` | `boolean`                 | If `true`, the library validates your `publicEnv` object against the schema during `next build`. Useful for failing builds early in CI/CD. **Default: `false`**.                                                                                                                                                           |
| `dynamicRendering`    | `'auto'` \| `'manual'`    | Controls the dynamic rendering behavior. `'auto'` (default) automatically opts-out of static rendering by calling `noStore()`. `'manual'` requires you to manage rendering behavior yourself. **Warning:** Using `manual` incorrectly can lead to undefined variables. **Default: `'auto'`**. |

#### **Returns**

The function returns an object containing the `getPublicEnv` function and the
`PublicEnv` component.

| Property      | Type                | Description                                                                                                                             |
| :------------ | :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `getPublicEnv`| `() => EnvObject`   | A function that returns your public environment variables. The return type is inferred from your `publicEnv` object and Zod schema.      |
| `PublicEnv`   | `React.Component`   | A React component that must be rendered in your root layout to inject the environment variables for client-side access.               |