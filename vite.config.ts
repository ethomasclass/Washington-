import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works from any subpath — a GitHub Pages project
  // site, a district web server, or a folder opened over the network. The
  // deployment target for this is a school, and we do not get to pick the URL.
  base: './',
  server: {
    /*
     * Do not watch our own build output. `npm run build:single` writes a 1 MB
     * HTML file into the project, the dev watcher saw it appear and triggered a
     * full page reload, which raced the next write and reloaded again — a storm
     * that took the dev server down mid-session.
     */
    watch: { ignored: ['**/dist/**', '**/dist-single/**'] },
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        // The game.
        main: 'index.html',
        // Every figure, every facing, every phase of the walk, plus the prop
        // library and the tile set, at a size where the drawing can actually be
        // judged. A gait cannot be assessed one frame at a time, and certainly
        // not inside the game at eighty pixels while it is moving.
        sprites: 'sprites.html',
      },
    },
  },
});
