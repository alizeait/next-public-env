import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { createPublicEnv } from './';
import { render } from '@testing-library/react';
import * as nextNavigation from 'next/navigation';

vi.mock('next/navigation', () => ({
  useServerInsertedHTML: vi.fn(),
}));

describe('getPublicEnv', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // @ts-ignore
    delete global.window;
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  it('should return config values without schema', () => {
    const values = {
      API_URL: 'https://api.example.com',
      PORT: '3000',
    };

    const { getPublicEnv } = createPublicEnv(values);
    const env = getPublicEnv();

    expect(env).toEqual(values);
  });

  it('should validate and return parsed values with schema', () => {
    const values = {
      NODE_ENV: 'development',
      PORT: '3000',
    };

    const { getPublicEnv } = createPublicEnv(values, {
      schema: (z) => ({
        NODE_ENV: z.enum(['development', 'production', 'test']),
        PORT: z.coerce.number(),
      }),
    });

    const env = getPublicEnv();

    expect(env).toEqual({
      NODE_ENV: 'development',
      PORT: 3000, // Coerced to number
    });
  });

  it('should throw error when called on client side', () => {
    // @ts-ignore
    global.window = {} as any;

    const { getPublicEnv } = createPublicEnv({ API_URL: 'test' });

    expect(() => getPublicEnv()).toThrow(
      "This wasn't supposed to happen. This file should only be resolved on the server.",
    );
  });

  it('should throw error on validation failure', () => {
    expect(() => {
      createPublicEnv(
        {
          NODE_ENV: 'invalid',
          PORT: 'not-a-number',
        },
        {
          schema: (z) => ({
            NODE_ENV: z.enum(['development', 'production']),
            PORT: z.coerce.number(),
          }),
        },
      );
    }).toThrow(`❌ Invalid environment variables found:
- Invalid variable [NODE_ENV]: Invalid option: expected one of "development"|"production"
- Invalid variable [PORT]: Invalid input: expected number, received NaN`);
  });

  it('should handle optional fields in schema', () => {
    const values = {
      REQUIRED_VAR: 'value',
    };
    // @ts-expect-error testing optional
    const { getPublicEnv } = createPublicEnv(values, {
      schema: (z) => ({
        REQUIRED_VAR: z.string(),
        OPTIONAL_VAR: z.string().optional(),
      }),
    });

    const env = getPublicEnv();

    expect(env).toEqual({
      REQUIRED_VAR: 'value',
      OPTIONAL_VAR: undefined,
    });
  });

  it('should handle complex zod transformations', () => {
    const values = {
      IS_DEV: 'true',
      MAX_RETRIES: '5',
    };

    const { getPublicEnv } = createPublicEnv(values, {
      schema: (z) => ({
        IS_DEV: z
          .string()
          .transform((val) => val === 'true')
          .pipe(z.boolean()),
        MAX_RETRIES: z.coerce.number().min(1).max(10),
      }),
    });

    const env = getPublicEnv();

    expect(env).toEqual({
      IS_DEV: true,
      MAX_RETRIES: 5,
    });
  });
});

describe('PublicEnv', () => {
  const useServerInsertedHTML = nextNavigation.useServerInsertedHTML;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should flush script tag with serialized config', () => {
    const values = {
      API_URL: 'https://api.example.com',
      PORT: 3000,
    };

    const { PublicEnv } = createPublicEnv(values);
    render(<PublicEnv />);

    expect(useServerInsertedHTML).toHaveBeenCalled();

    const callback = (useServerInsertedHTML as Mock).mock.calls[0][0];
    const scriptElement = callback();

    expect(scriptElement.type).toBe('script');
    expect(scriptElement.props.dangerouslySetInnerHTML.__html).toBe(
      `window.__NEXT_PUBLIC_ENV = ${JSON.stringify(values)}`,
    );
  });

  it('should flush script tag with serialized config only once', () => {
    const values = {
      API_URL: 'https://api.example.com',
      PORT: 3000,
    };

    const { PublicEnv } = createPublicEnv(values);
    const { rerender } = render(<PublicEnv />);

    expect(useServerInsertedHTML).toHaveBeenCalled();

    const callback = (useServerInsertedHTML as Mock).mock.calls[0][0];
    const scriptElement = callback();

    expect(scriptElement.type).toBe('script');
    expect(scriptElement.props.dangerouslySetInnerHTML.__html).toBe(
      `window.__NEXT_PUBLIC_ENV = ${JSON.stringify(values)}`,
    );

    rerender(<PublicEnv />);

    const callback2 = (useServerInsertedHTML as Mock).mock.calls[0][0];
    const scriptElement2 = callback2();

    expect(scriptElement2).toBe(null);
  });

  it('should serialize validated and transformed values', () => {
    const values = {
      NODE_ENV: 'production',
      PORT: '8080',
      IS_SECURE: 'true',
    };

    const { PublicEnv } = createPublicEnv(values, {
      schema: (z) => ({
        NODE_ENV: z.enum(['development', 'production']),
        PORT: z.coerce.number(),
        IS_SECURE: z
          .string()
          .transform((val) => val === 'true')
          .pipe(z.boolean()),
      }),
    });

    render(<PublicEnv />);

    const callback = (useServerInsertedHTML as Mock).mock.calls[0][0];
    const scriptElement = callback();

    const expectedConfig = {
      NODE_ENV: 'production',
      PORT: 8080,
      IS_SECURE: true,
    };

    expect(scriptElement.props.dangerouslySetInnerHTML.__html).toBe(
      `window.__NEXT_PUBLIC_ENV = ${JSON.stringify(expectedConfig)}`,
    );
  });

  it('should handle empty config', () => {
    const { PublicEnv } = createPublicEnv({});
    render(<PublicEnv />);

    const callback = (useServerInsertedHTML as Mock).mock.calls[0][0];
    const scriptElement = callback();

    expect(scriptElement.props.dangerouslySetInnerHTML.__html).toBe(
      'window.__NEXT_PUBLIC_ENV = {}',
    );
  });
});
