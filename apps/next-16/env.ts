import { createPublicEnv } from 'next-public-env';

export const { PublicEnv, getPublicEnv } = createPublicEnv(
  {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_HELLO: process.env.NEXT_PUBLIC_HELLO,
  },
  {
    schema: (z) => ({
      NEXT_PUBLIC_APP_NAME: z.string(),
      NEXT_PUBLIC_APP_VERSION: z.string(),
      NEXT_PUBLIC_HELLO: z.string(),
    }),
  },
);
