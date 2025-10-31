export function createPublicEnv() {
  return {
    getPublicEnv() {
      if (!('__NEXT_PUBLIC_ENV' in window)) {
        console.error(
          `"__NEXT_PUBLIC_ENV" was not found on Window. Did you forget to render <PublicEnv /> in your root Layout?`,
        );
      }

      return window.__NEXT_PUBLIC_ENV || {};
    },

    PublicEnv() {
      return null;
    },
  };
}

declare global {
  interface Window {
    __NEXT_PUBLIC_ENV?: Record<string, any>;
  }
}
