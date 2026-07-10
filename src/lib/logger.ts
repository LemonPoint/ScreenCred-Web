import { dev } from '$app/environment';
import winston from 'winston';

export const logger = winston.createLogger({
	level: dev ? 'debug' : 'info',
	format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
	transports: [new winston.transports.Console()]
});
