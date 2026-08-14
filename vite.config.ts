import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works from any subpath — a GitHub Pages project
  // site, a district web server, or a folder opened over the network. The
  // deployment target for this is a school, and we do not get to pick the URL.
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        // The game.
        main: 'index.html',
        // A comparison bench for picking a decision-UI direction. Not the game.
        variants: 'variants.html',
      },
    },
  },
});
