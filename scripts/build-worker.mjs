// The Vite build leaves `new Worker(new URL(...))` untouched and emits
// nothing for it, so the worker needs its own build step written into build/.
import { build } from 'esbuild';

await build({
	entryPoints: ['src/lib/server/image/render-worker.ts'],
	outfile: 'build/worker/render.js',
	bundle: true,
	platform: 'node',
	format: 'esm',
	target: 'node22',
	external: ['@resvg/resvg-js', 'sharp'],
	sourcemap: true
});

console.log('built build/worker/render.js');
