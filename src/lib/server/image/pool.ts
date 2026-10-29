import { dev } from '$app/env';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Worker } from 'node:worker_threads';

const DEFAULT_POOL_SIZE = Math.min(4, os.availableParallelism());
const POOL_SIZE = Math.max(
	1,
	Math.min(os.availableParallelism(), Number(process.env.IMAGE_WORKERS) || DEFAULT_POOL_SIZE)
);
const MAX_QUEUED = Math.max(POOL_SIZE, Number(process.env.IMAGE_QUEUE_LIMIT) || 32);
const IDLE_TIMEOUT_MS = Math.max(0, Number(process.env.IMAGE_IDLE_TIMEOUT_MS ?? 60_000));

type WorkerReply = { ok: true; jpeg: Uint8Array } | { ok: false; error: string };

interface Job {
	id: string;
	resolve: (jpeg: Buffer) => void;
	reject: (error: Error) => void;
}

function resolveSamPath(): string {
	const candidates = [
		path.join(process.cwd(), 'static/img/sam.jpg'),
		path.join(process.cwd(), 'build/client/img/sam.jpg')
	];

	const found = candidates.find((candidate) => existsSync(candidate));
	if (!found) {
		throw new Error(`Could not locate sam.jpg. Looked in: ${candidates.join(', ')}`);
	}

	return found;
}

function workerEntry(): string | URL {
	if (dev) {
		return new URL('./render-worker.ts', import.meta.url);
	}

	// Emitted by scripts/build-worker.mjs. Chunk paths are hashed, so anchor on cwd.
	return path.join(process.cwd(), 'build/worker/render.js');
}

class RenderPool {
	private samPath: string | undefined;
	private workers: Worker[] = [];
	private idle: Worker[] = [];
	private idleTimers = new Map<Worker, NodeJS.Timeout>();
	private jobs = new Map<Worker, Job>();
	private queue: Job[] = [];

	run(id: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			if (this.queue.length >= MAX_QUEUED) {
				reject(new Error(`Render queue is full (${MAX_QUEUED} waiting)`));
				return;
			}

			this.queue.push({ id, resolve, reject });
			this.drain();
		});
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

			this.markIdle(worker);
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

	private markIdle(worker: Worker) {
		this.idle.push(worker);
		if (IDLE_TIMEOUT_MS === 0) return;

		const timer = setTimeout(() => {
			this.idleTimers.delete(worker);
			if (!this.idle.includes(worker)) return;
			this.forget(worker);
			void worker.terminate();
		}, IDLE_TIMEOUT_MS);

		timer.unref();
		this.idleTimers.set(worker, timer);
	}

	private takeIdle(): Worker | undefined {
		const worker = this.idle.pop();
		if (!worker) return undefined;

		const timer = this.idleTimers.get(worker);
		if (timer) {
			clearTimeout(timer);
			this.idleTimers.delete(worker);
		}

		return worker;
	}

	private forget(worker: Worker) {
		const timer = this.idleTimers.get(worker);
		if (timer) {
			clearTimeout(timer);
			this.idleTimers.delete(worker);
		}

		this.workers = this.workers.filter((candidate) => candidate !== worker);
		this.idle = this.idle.filter((candidate) => candidate !== worker);
	}

	private failInFlight(worker: Worker, error: Error) {
		const job = this.jobs.get(worker);
		if (!job) return;
		this.jobs.delete(worker);
		job.reject(error);
	}

	async shutdown() {
		for (const queued of this.queue.splice(0)) {
			queued.reject(new Error('Render pool is shutting down'));
		}

		const workers = this.workers;
		this.workers = [];
		this.idle = [];

		for (const timer of this.idleTimers.values()) clearTimeout(timer);
		this.idleTimers.clear();

		await Promise.allSettled(workers.map((worker) => worker.terminate()));
	}

	private drain() {
		while (this.queue.length > 0) {
			let worker = this.takeIdle();

			if (!worker) {
				if (this.workers.length >= POOL_SIZE) return;

				try {
					worker = this.spawn();
				} catch (error) {
					const cause = error instanceof Error ? error : new Error(String(error));
					for (const queued of this.queue.splice(0)) queued.reject(cause);
					return;
				}

				this.workers.push(worker);
			}

			const job = this.queue.shift()!;
			this.jobs.set(worker, job);

			try {
				worker.postMessage(job.id);
			} catch (error) {
				this.jobs.delete(worker);
				this.forget(worker);
				void worker.terminate();
				job.reject(error instanceof Error ? error : new Error(String(error)));
			}
		}
	}
}

const pool = new RenderPool();

// Collapse a cold burst into one render per id.
const inFlight = new Map<string, Promise<Buffer>>();

export function renderComparison(id: string): Promise<Buffer> {
	const existing = inFlight.get(id);
	if (existing) return existing;

	const promise = pool.run(id).finally(() => inFlight.delete(id));
	inFlight.set(id, promise);
	return promise;
}

export function shutdownRenderPool(): Promise<void> {
	return pool.shutdown();
}
