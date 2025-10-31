import { z } from 'zod/v4';
import * as z4 from 'zod/v4/core';
import { FlushConfig } from './FlushConfig';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { unstable_noStore as noStore } from 'next/cache';

declare global {
  interface Window {
    __NEXT_PUBLIC_ENV?: Record<string, any>;
  }
}

type ZodError = z4.$ZodError;

type SchemaShapeFactory<Shape extends z4.$ZodShape = z4.$ZodShape> = (
  zod: typeof z,
) => Shape;

function formatZodError(error: ZodError): string {
  const issues = error.issues.map((issue) => {
    const variable = issue.path.join('.') || 'configuration';
    return `- Invalid variable [${variable}]: ${issue.message}`;
  });
  return `❌ Invalid environment variables found:\n${issues.join('\n')}`;
}

type Options<Shape extends z4.$ZodShape> = {
  /**
   * A factory function that receives zod and returns an object shape.
   * The shape will be wrapped with z.object() internally.
   *
   * @example
   * schema: (z) => ({
   *   NODE_ENV: z.enum(['development', 'production']),
   *   API_URL: z.string().url()
   * })
   */
  schema?: SchemaShapeFactory<Shape>;
  /**
   * Next.js statically generates 404 and other static pages at build time.
   *
   * By default, next-public-env validation runs only at runtime (next start)
   * when the process starts since some environment variables may not be
   * available at build time.
   *
   * To also run validation at build time (next build), set this to `true`.
   * @default false
   */
  validateAtBuildStep?: boolean;

  /**
   * Controls how `getPublicEnv` opts-out of Next.js' static rendering.
   *
   * - `auto`: (Default) Automatically calls `noStore()` from `next/cache`
   *   wherever `getPublicEnv()` is used. This ensures the route is
   *   dynamically rendered, which is crucial for accessing environment
   *   variables that are only available at runtime.
   *
   * - `manual`: Disables the automatic `noStore()` call. Use this if you
   *   want to manually control the rendering behavior of your routes.
   *
   * @warning When set to `manual`, you are responsible for ensuring that
   * routes using `getPublicEnv()` are not statically built, as this could
   * lead to runtime environment variables being undefined.
   *
   * @default 'auto'
   */
  dynamicRendering?: 'auto' | 'manual';
};

type PublicEnvType = (props: { nonce?: string }) => React.ReactElement;

export function createPublicEnv<
  Shape extends z4.$ZodShape,
  T extends Record<keyof Shape, any>,
>(
  values: T,
  options: Options<Shape> & { schema: SchemaShapeFactory<Shape> },
): {
  getPublicEnv: () => z4.infer<z4.$ZodObject<Shape>>;
  PublicEnv: PublicEnvType;
};
export function createPublicEnv<T extends Record<string, any>>(
  values: T,
  options?: Omit<Options<never>, 'schema'>,
): {
  getPublicEnv: () => T;
  PublicEnv: PublicEnvType;
};
export function createPublicEnv(values: any, options?: Options<z4.$ZodShape>) {
  const schemaShapeFactory = options?.schema;

  const isBuildStep = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
  const config = (() => {
    if (!schemaShapeFactory || (isBuildStep && !options?.validateAtBuildStep)) {
      return values;
    }

    const shape = schemaShapeFactory(z);
    const schema = z.object(shape);

    const result = z4.safeParse(schema, values);
    if (!result.success) {
      const formattedError = formatZodError(result.error);
      throw new Error(formattedError);
    }
    return result.data;
  })();

  const stringifiedConfig = JSON.stringify(config);

  const dynamicRendering = options?.dynamicRendering ?? 'auto';

  return {
    /**
     * @returns The parsed and validated environment variables.
     */
    getPublicEnv() {
      if (typeof window !== 'undefined') {
        throw new Error(
          "This wasn't supposed to happen. This file should only be resolved on the server.",
        );
      }

      if (dynamicRendering === 'auto') {
        noStore();
      }

      return config;
    },
    /**
     * A React component that serializes and flushes environment variables to
     * the client.
     */
    PublicEnv({ nonce }: { nonce?: string }) {
      if (dynamicRendering === 'auto') {
        noStore();
      }

      return <FlushConfig config={stringifiedConfig} nonce={nonce} />;
    },
  };
}
