import { error, json } from '@sveltejs/kit';

export function GET() {
	// return json({ status: 'ok' });
	throw error(500, 'Intentional failure');
}
