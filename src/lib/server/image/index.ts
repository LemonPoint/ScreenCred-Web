import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { timingSafeEqual } from 'node:crypto';
import os from 'node:os';
import { poolSize, renderComparison } from './pool';
import { renderCard, resolveSamPath } from './render';

/**
 * Which code path serves card images.
 *
 *   proxy  — forward to the standalone ScreenCred-Image service (IMAGE_API).
 *   worker — render in-process on a worker_threads pool.
 *   inline — render in-process on the main thread. Blocks the event loop for
 *            the whole render, which is the behaviour that made us split the
 *            app in the first place. Measurement only.
 *
 * The default is hardcoded, deliberately: there is no IMAGE_MODE env var. To
 * adopt a path for real traffic, change DEFAULT_MODE and deploy — one
 * reviewable change, no runtime switch that can be flipped by accident.
 *
 * `worker` and `inline` are still reachable per request through the override
 * below, so both paths can be measured in the same load-test run without
 * changing production behaviour for real users.
 */
export type ImageMode = 'proxy' | 'worker' | 'inline';

/**
 * Production path. Change to 'worker' to adopt the monolith, then delete the
 * losing branch, this constant, and the override below.
 */
const DEFAULT_MODE: ImageMode = 'proxy';

export interface CardImage {
	body: Uint8Array<ArrayBuffer>;
	contentType: string;
	mode: ImageMode;
}

export interface ModeResolution {
	mode: ImageMode;
	/** True when the mode came from a request override rather than the default. */
	overridden: boolean;
}

/** Thrown for a malformed or disallowed override, so the route can answer 403. */
export class ModeOverrideError extends Error {}

const OVERRIDE_HEADER = 'x-image-mode-override';
const TOKEN_HEADER = 'x-image-mode-token';

function tokenMatches(provided: string | null): boolean {
	const expected = env.IMAGE_MODE_OVERRIDE_TOKEN;
	if (!expected || !provided) return false;

	const given = Buffer.from(provided);
	const want = Buffer.from(expected);
	if (given.length !== want.length) return false;

	return timingSafeEqual(given, want);
}

function inlineAllowed(): boolean {
	return env.IMAGE_MODE_ALLOW_INLINE === '1';
}

export function resolveMode(headers: Headers): ModeResolution {
	const requested = headers.get(OVERRIDE_HEADER);

	if (!requested) return { mode: DEFAULT_MODE, overridden: false };

	// Silently ignore overrides when no token is configured, so a deployment
	// without the feature enabled behaves exactly like DEFAULT_MODE.
	if (!env.IMAGE_MODE_OVERRIDE_TOKEN) return { mode: DEFAULT_MODE, overridden: false };

	if (!tokenMatches(headers.get(TOKEN_HEADER))) {
		throw new ModeOverrideError('Invalid image mode override token');
	}

	const mode = requested.toLowerCase();

	if (mode !== 'proxy' && mode !== 'worker' && mode !== 'inline') {
		throw new ModeOverrideError(`Unknown image mode "${requested}"`);
	}

	// inline is a one-request denial of service: it parks the event loop for the
	// whole render, stalling every other request on the instance. One token is
	// not enough authorisation for that, so it needs a second, explicit switch
	// that you turn on for a measurement and turn off again.
	if (mode === 'inline' && !inlineAllowed()) {
		throw new ModeOverrideError(
			'inline is disabled; set IMAGE_MODE_ALLOW_INLINE=1 on the service to permit it'
		);
	}

	return { mode, overridden: true };
}

export function describeRenderer(): string {
	const flags = [env.IMAGE_MODE_OVERRIDE_TOKEN ? 'override' : null, inlineAllowed() ? 'inline' : null]
		.filter(Boolean)
		.join(', ');

	if (DEFAULT_MODE === 'worker') return `worker (${poolSize} threads)${flags ? ` [${flags}]` : ''}`;
	return `${DEFAULT_MODE}${flags ? ` [${flags}]` : ''}`;
}

// One line at boot so you can confirm the pool size and what the container
// reports as available cores — worth checking when you change Railway's vCPU
// limit, since that value decides the default pool size.
if (!building) {
	console.log(
		`[og-image] mode=${describeRenderer()} availableParallelism=${os.availableParallelism()}`
	);
}

export async function getCard(id: string, mode: ImageMode = DEFAULT_MODE): Promise<CardImage> {
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
		throw new Error('Image mode is proxy but IMAGE_API is not set');
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
