import { logger } from '$lib/logger';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const startTime = Date.now();

	event.locals.logger = logger;

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

export const handleError: HandleServerError = ({error, event}) => {
	logger.error({
		method: event.request.method,
		path: event.url.pathname,
		error: error instanceof Error ? error.message : 'Unknown error',
		stack: error instanceof Error ? error.stack : undefined,
		msg: 'Unhandled error'
	});

	return {
		message: 'Internal error'
	};
}