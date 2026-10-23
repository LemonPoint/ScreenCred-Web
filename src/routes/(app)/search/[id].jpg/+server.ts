import { error } from '@sveltejs/kit';
import { getCard } from '$lib/server/image';

const CACHE_CONTROL = 'public, max-age=2592000, stale-while-revalidate=604800';

export async function GET({ params, locals }) {
	const id = params.id;

	if (!id.includes('__')) {
		throw error(404, 'Expected an image id of the form <poster>__<poster>');
	}

	try {
		const { body, contentType, mode } = await getCard(id);

		return new Response(body, {
			headers: {
				'Content-Type': contentType,
				'Content-Length': String(body.byteLength),
				'Cache-Control': CACHE_CONTROL,
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
			params: id.split('__')
		});

		throw error(500, 'Image generation failed');
	}
}
