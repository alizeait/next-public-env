import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/browser/index.ts',
    'src/server/index.tsx',
    'src/server/FlushConfig.tsx',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  esbuildPlugins: [
    {
      name: 'local-files-external',
      setup(build) {
        build.onResolve({ filter: /^\.\/FlushConfig$/ }, (args) => {
          return { path: args.path, external: true };
        });
      },
    },
  ],
  sourcemap: false,
  minify: true,
});
