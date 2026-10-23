import { parentPort, workerData } from 'node:worker_threads';
import sharp from 'sharp';
import { renderCard } from './render.ts';

// libvips defaults to an 8-thread pool per process; the render pool already
// provides parallelism, so one thread per worker avoids oversubscribing.
sharp.concurrency(1);

const { samPath } = workerData as { samPath: string };

parentPort?.on('message', async (id: string) => {
	try {
		const jpeg = await renderCard(id, samPath);
		parentPort!.postMessage({ ok: true, jpeg });
	} catch (error) {
		parentPort!.postMessage({
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		});
	}
});
