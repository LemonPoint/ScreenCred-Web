import os from 'node:os';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { dev } from '$app/environment';
import { resolveSamPath } from './render';

/**
 * A small worker_threads pool for OG card rendering.
 *
 * Why this exists: resvg's render() is synchronous CPU work (~580ms for this
 * card) and blocks the event loop for its whole duration. Doing it inline makes
 * every other request — including /health — wait. The pool keeps the main thread
 * free and gives us `IMAGE_WORKERS` renders in flight per replica instead of 1.
 *
 * Size defaults to availableParallelism(), capped at 4, so a 1 vCPU replica
 * gets exactly one worker rather than four threads fighting over one core.
 */

const DEFAULT_WORKERS = Math.min(4, os.availableParallelism());

export const poolSize = Math.max(1, Number(process.env.IMAGE_WORKERS) || DEFAULT_WORKERS);

type WorkerReply = { ok: true; jpeg: Uint8Array } | { ok: false; error: string };

interface Job {
	id: string;
	resolve: (jpeg: Buffer) => void;
	reject: (error: Error) => void;
}

function workerEntry(): string | URL {
	if (dev) {
		// In dev Node runs the TypeScript source directly via type stripping.
		return new URL('./render-worker.ts', import.meta.url);
	}

	// In production the file is emitted by scripts/build-worker.mjs next to the
	// adapter-node output. Chunk paths are hashed, so anchor on cwd, which the
	// Dockerfile sets to /app.
	return path.join(process.cwd(), 'build/worker/render.js');
}

class RenderPool {
	private size: number;
	private samPath: string | undefined;
	private workers: Worker[] = [];
	private idle: Worker[] = [];
	private jobs = new Map<Worker, Job>();
	private queue: Job[] = [];

	constructor(size: number) {
		this.size = size;
	}

	run(id: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			this.queue.push({ id, resolve, reject });
			this.drain();
		});
	}

	close(): void {
		for (const worker of this.workers) {
			void worker.terminate();
		}
		this.workers = [];
		this.idle = [];
		this.jobs.clear();
		this.queue = [];
	}

	private spawn(): Worker {
		this.samPath ??= resolveSamPath();

		const worker = new Worker(workerEntry(), { workerData: { samPath: this.samPath } });

		worker.on('message', (reply: WorkerReply) => {
			const job = this.jobs.get(worker);
			if (!job) return;

			this.jobs.delete(worker);
			if (reply.ok) {
				job.resolve(Buffer.from(reply.jpeg));
			} else {
				job.reject(new Error(reply.error));
			}

			this.idle.push(worker);
			this.drain();
		});

		worker.on('error', (error) => {
			const cause = error instanceof Error ? error : new Error(String(error));
			this.forget(worker);
			this.failInFlight(worker, cause);
			this.drain();
		});

		worker.on('exit', (code) => {
			this.forget(worker);
			this.failInFlight(worker, new Error(`Render worker exited with code ${code}`));
			this.drain();
		});

		return worker;
	}

	private forget(worker: Worker) {
		this.workers = this.workers.filter((candidate) => candidate !== worker);
		this.idle = this.idle.filter((candidate) => candidate !== worker);
	}

	private failInFlight(worker: Worker, error: Error) {
		const job = this.jobs.get(worker);
		if (!job) return;
		this.jobs.delete(worker);
		job.reject(error);
	}

	private drain() {
		while (this.queue.length > 0) {
			let worker = this.idle.pop();

			if (!worker) {
				if (this.workers.length >= this.size) return;
				worker = this.spawn();
				this.workers.push(worker);
			}

			const job = this.queue.shift()!;
			this.jobs.set(worker, job);
			worker.postMessage(job.id);
		}
	}
}

const pool = new RenderPool(poolSize);

/** In-flight renders keyed by id, so a cold burst renders each card once. */
const inFlight = new Map<string, Promise<Buffer>>();

export function renderComparison(id: string): Promise<Buffer> {
	const existing = inFlight.get(id);
	if (existing) return existing;

	const promise = pool.run(id).finally(() => inFlight.delete(id));
	inFlight.set(id, promise);
	return promise;
}

export function shutdownPool(): void {
	pool.close();
}
