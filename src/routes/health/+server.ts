import { error, json } from '@sveltejs/kit';

export function GET() {
	return error(500);
	// return json({ status: 'ok' });
}
