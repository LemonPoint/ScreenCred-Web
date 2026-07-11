/// <reference types="node" />

import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import ky from 'ky';

export async function GET({ params, locals }) {
	const id = params.id;
	try {
		return ky.get(`${env.IMAGE_API}/${id}.png`);
	} catch (error) {
		locals.logger.error('Failed to generate image', {
			error,
			id,
			params: params.id.split('__')
		});
		return redirect(307, '/img/screencred_social.png');
	}
}
