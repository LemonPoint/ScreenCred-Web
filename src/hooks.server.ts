import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { logger } from '#lib/logger.js';

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

export const handleError: HandleServerError = ({ kind, error, event }) => {
	// SvelteKit 3 passes expected and validation errors here too, not just
	// unexpected 500s. Only unknown errors are necessarily 500s.
	const status = kind === 'unknown' ? 500 : error.status;

	if (status === 500) {
		logger.error('Unhandled error', {
			method: event.request.method,
			path: event.url.pathname,
			kind,
			error: errorMessage(error),
			stack: error instanceof Error ? error.stack : undefined
		});
	}

	return {
		message: status === 404 ? 'Not Found' : 'Internal Error'
	};
};

function errorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === 'object' && error !== null && 'message' in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === 'string') return message;
	}
	return 'Unknown error';
}
