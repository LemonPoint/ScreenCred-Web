import { redirect } from '@sveltejs/kit';

/**
 * Card URLs moved from .png to .jpg when the renderer started emitting JPEG.
 * Old URLs are still referenced by previews that social platforms cached
 * before the switch, so keep them working.
 */
export function GET({ params }) {
	throw redirect(308, `/search/${params.id}.jpg`);
}
