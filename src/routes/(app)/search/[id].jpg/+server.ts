import { error } from '@sveltejs/kit';
import { getCard, ModeOverrideError, resolveMode } from '$lib/server/image';

const CACHE_CONTROL = 'public, max-age=2592000, stale-while-revalidate=604800';

export async function GET({ params, request, locals }) {
	const id = params.id;

	if (!id.includes('__')) {
		throw error(404, 'Expected an image id of the form <poster>__<poster>');
	}

	let resolution;
	try {
		resolution = resolveMode(request.headers);
	} catch (err) {
		if (err instanceof ModeOverrideError) {
			throw error(403, err.message);
		}
		throw err;
	}

	try {
		const { body, contentType, mode } = await getCard(id, resolution.mode);

		return new Response(body, {
			headers: {
				'Content-Type': contentType,
				'Content-Length': String(body.byteLength),
				// An overridden response must never reach the edge cache: the CDN
				// keys on URL, not on the override header, so storing it would
				// poison the URL for whichever mode ran first.
				'Cache-Control': resolution.overridden ? 'private, no-store' : CACHE_CONTROL,
				// Lets a load test prove which code path actually answered.
				'X-Image-Mode': mode
			}
		});
	} catch (err) {
		// PoC: surface failures so load tests see them. The previous proxy
		// redirected to /img/screencred_social.png (307), which hid failures.
		locals.logger.error('Failed to generate OG image', {
			error: err instanceof Error ? err.message : 'Unknown error',
			stack: err instanceof Error ? err.stack : undefined,
			id,
			mode: resolution.mode,
			params: id.split('__')
		});

		throw error(500, 'Image generation failed');
	}
}
