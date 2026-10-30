import { error, redirect } from '@sveltejs/kit';
import { renderComparison } from '#lib/server/image/pool.ts';

const CACHE_CONTROL = 'public, max-age=2592000, stale-while-revalidate=604800';

export async function GET({ params, locals }) {
	const id = params.id;

	if (!id.includes('__')) {
		throw error(404, 'Expected an image id of the form <poster>__<poster>');
	}

	try {
		const jpeg = await renderComparison(id);

		return new Response(new Uint8Array(jpeg), {
			headers: {
				'Content-Type': 'image/jpeg',
				'Content-Length': String(jpeg.byteLength),
				'Cache-Control': CACHE_CONTROL
			}
		});
	} catch (err) {
		locals.logger.error('Failed to generate OG image', {
			error: err instanceof Error ? err.message : 'Unknown error',
			stack: err instanceof Error ? err.stack : undefined,
			id,
			params: id.split('__')
		});

		throw redirect(307, '/img/screencred_social.png');
	}
}
