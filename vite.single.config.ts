import { defineConfig } from 'vite';

// A one-file build: the whole game as a single ES module, so it can be dropped
// into one HTML page with no server, no asset paths and no host to fetch from.
export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: () => 'game.js',
    },
    outDir: 'dist-single',
    target: 'es2020',
    assetsInlineLimit: 100000000,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
