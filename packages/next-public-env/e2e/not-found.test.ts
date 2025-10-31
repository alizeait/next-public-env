import { test, expect } from '@playwright/test';

test.describe('Not Found Page', () => {
  test('getPublicEnv returns the expected data on the client in a not-found page', async ({
    page,
  }) => {
    await page.goto('/not-found-test');

    const data = await page.locator('#__NEXT_PUBLIC_ENV__').textContent();

    expect(JSON.parse(data!)).toEqual({
      NEXT_PUBLIC_APP_NAME: 'next-public-env',
      NEXT_PUBLIC_APP_VERSION: '0.1.0',
      NEXT_PUBLIC_HELLO: 'world',
    });
  });
});
