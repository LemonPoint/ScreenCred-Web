import { logger } from '$lib/logger';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const startTime = Date.now();

	event.locals.logger = logger;

	const response = await resolve(event);

	const duration = Date.now() - startTime;

	logger.info('Request completed', {
		method: event.request.method,
		path: event.url.pathname,
		status: response.status,
		duration: `${duration}ms`
	});

	return response;
};

export const handleError: HandleServerError = ({ error, event, status }) => {
	if (status === 500) {
		logger.error('Unhandled error', {
			method: event.request.method,
			path: event.url.pathname,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined
		});
	}

	return {
		message: status === 404 ? 'Not Found' : 'Internal Error'
	};
};
