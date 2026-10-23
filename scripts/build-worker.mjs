#!/usr/bin/env node
/**
 * adapter-node builds the SSR bundle with Vite, whose worker support is
 * client-only (vite:worker-import-meta-url declares
 * `applyToEnvironment: env => env.config.consumer === 'client'`). So
 * `new Worker(new URL(...))` is left in the output verbatim and nothing is
 * emitted alongside it — which fails at runtime, only in production.
 *
 * We therefore build the worker as a separate Node entry point and write it
 * into the adapter output. Native modules must stay external (they cannot be
 * bundled into ESM).
 */
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
