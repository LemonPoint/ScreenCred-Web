import { logger } from '$lib/logger';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const startTime = Date.now();

	event.locals.logger = logger;

	logger.info({
		method: event.request.method,
		path: event.url.pathname,
		msg: 'Incoming request'
	});

	const response = await resolve(event);

	const duration = Date.now() - startTime;

	logger.info({
		method: event.request.method,
		path: event.url.pathname,
		status: response.status,
		duration: `${duration}ms`,
		msg: 'Request completed'
	});

	return response;
};