import { dev } from '$app/environment';
import winston from 'winston';

export const logger = winston.createLogger({
	level: dev ? 'debug' : 'info',
	transports: [new winston.transports.Console()]
});