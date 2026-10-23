import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import os from 'node:os';
import { poolSize, renderComparison } from './pool';
import { renderCard, resolveSamPath } from './render';

/**
 * Which code path serves card images, selected at runtime by IMAGE_MODE.
 *
 *   proxy  — forward to the standalone ScreenCred-Image service (IMAGE_API).
 *            Current production behaviour; the default.
 *   worker — render in-process on a worker_threads pool. The candidate.
 *   inline — render in-process on the main thread. Reproduces the original
 *            combined-app behaviour, where rendering blocked every other
 *            request. Only useful for load-test baselines; never for production.
 *
 * Runtime env (not build-time) so the mode can be flipped on a deployed service
 * without rebuilding, which is what makes a same-instance A/B possible.
 */
export type ImageMode = 'proxy' | 'worker' | 'inline';

export interface CardImage {
	body: Uint8Array<ArrayBuffer>;
	contentType: string;
	mode: ImageMode;
}

export function imageMode(): ImageMode {
	const raw = (env.IMAGE_MODE ?? 'proxy').toLowerCase();
	if (raw === 'worker' || raw === 'inline') return raw;
	if (raw !== 'proxy') {
		console.warn(`Unknown IMAGE_MODE "${raw}", falling back to proxy`);
	}
	return 'proxy';
}

export function describeRenderer(): string {
	const mode = imageMode();
	if (mode === 'worker') return `worker (${poolSize} threads)`;
	return mode;
}

// One line at boot so you can confirm the pool size and what the container
// reports as available cores — worth checking when you change Railway's vCPU
// limit, since that value decides the default pool size.
if (!building) {
	console.log(
		`[og-image] mode=${describeRenderer()} availableParallelism=${os.availableParallelism()}`
	);
}

export async function getCard(id: string): Promise<CardImage> {
	const mode = imageMode();

	if (mode === 'worker') {
		const jpeg = await renderComparison(id);
		return { body: new Uint8Array(jpeg), contentType: 'image/jpeg', mode };
	}

	if (mode === 'inline') {
		const jpeg = await renderCard(id, resolveSamPath());
		return { body: new Uint8Array(jpeg), contentType: 'image/jpeg', mode };
	}

	// proxy: ScreenCred-Image still routes on `<id>.png` even though it now
	// returns JPEG bytes, so the path is .png and the content type comes from
	// the upstream response.
	if (!env.IMAGE_API) {
		throw new Error('IMAGE_MODE=proxy but IMAGE_API is not set');
	}

	const upstream = await fetch(`${env.IMAGE_API}/${id}.png`);
	if (!upstream.ok) {
		throw new Error(`image service responded ${upstream.status}`);
	}

	return {
		body: new Uint8Array(await upstream.arrayBuffer()),
		contentType: upstream.headers.get('content-type') ?? 'image/jpeg',
		mode
	};
}
