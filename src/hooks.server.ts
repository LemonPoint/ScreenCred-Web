import type { ServerInit } from '@sveltejs/kit';
import { initWasm } from '@resvg/resvg-wasm';

export const init: ServerInit = async () => {
	// TODO: Bundle from node_modules somehow
	await initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'));
};
