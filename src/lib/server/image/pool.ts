import { dev } from '$app/environment';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Worker } from 'node:worker_threads';

// One thread per vCPU, capped, so a 1 vCPU replica doesn't spawn four workers.
const POOL_SIZE = Math.min(4, os.availableParallelism());

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
	private jobs = new Map<Worker, Job>();
	private queue: Job[] = [];

	run(id: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
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
				if (this.workers.length >= POOL_SIZE) return;
				worker = this.spawn();
				this.workers.push(worker);
			}

			const job = this.queue.shift()!;
			this.jobs.set(worker, job);
			worker.postMessage(job.id);
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
