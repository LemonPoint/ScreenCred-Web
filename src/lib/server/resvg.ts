import { initWasm } from '@resvg/resvg-wasm';

let wasmInitialized = false;

export async function ensureWasmInitialized(fetch: typeof globalThis.fetch) {
	if (!wasmInitialized) {
		// TODO: Bundle from node_modules somehow
		await initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'));
		wasmInitialized = true;
	}
}
