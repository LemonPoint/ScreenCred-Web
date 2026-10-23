import { redirect } from '@sveltejs/kit';

// Cards are served as .jpg now; keep old .png links from cached previews working.
export function GET({ params }) {
	throw redirect(308, `/search/${params.id}.jpg`);
}
