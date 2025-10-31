import { defineConfig, devices } from '@playwright/test';

const env = {
  NEXT_PUBLIC_HELLO: 'world',
  NEXT_PUBLIC_APP_NAME: 'next-public-env',
  NEXT_PUBLIC_APP_VERSION: '0.1.0',
};
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Run tests in files in parallel */
  fullyParallel: true,

  testDir: './e2e',
  // globalTeardown: './teardown.ts',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'next-16',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
    },
    {
      name: 'next-15',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3001' },
    },
    {
      name: 'next-14',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3002' },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'yarn workspace next-16 run start',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      env,
      stderr: 'pipe',
      stdout: 'pipe',
    },
    {
      command: 'yarn workspace next-15 run start',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      env,
      stderr: 'pipe',
      stdout: 'pipe',
    },
    {
      command: 'yarn workspace next-14 run start',
      port: 3002,
      reuseExistingServer: !process.env.CI,
      env,
      stderr: 'pipe',
      stdout: 'pipe',
    },
  ],
});
