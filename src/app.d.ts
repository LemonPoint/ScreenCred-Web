import type { Logger } from 'winston';

declare global {
	namespace App {
		interface Locals {
			logger: Logger;
		}
	}
}

export {};
