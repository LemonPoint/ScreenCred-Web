/**
 * Worker-thread entry point. Thin wrapper around renderCard so the same code
 * also runs inline on the main thread when IMAGE_MODE=inline.
 *
 * In dev, Node loads this file directly (type stripping), hence the explicit
 * `.ts` extension on the import — Node does not rewrite extensionless paths.
 */
import { parentPort, workerData } from 'node:worker_threads';
import sharp from 'sharp';
import { renderCard } from './render.ts';

// libvips defaults to an 8-thread pool *per process*. With 4 render workers that
// is 32 threads competing for the replica's vCPUs, which makes throughput worse,
// not better. The pool already provides parallelism, so each worker stays
// single-threaded.
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
