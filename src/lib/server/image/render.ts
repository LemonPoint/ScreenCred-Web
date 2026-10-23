/**
 * Node builtins and npm packages only — no $lib, $app or $env imports. Only the
 * worker bundle (scripts/build-worker.mjs) loads this, so the SvelteKit server
 * never pulls in resvg or sharp on the main thread.
 */
import { readFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

const WIDTH = 1200;
const HEIGHT = 630;

const CARD_WIDTH = 270;
const CARD_HEIGHT = 405;
const CARD_GAP = 30;
const CARD_LEFT = (WIDTH - (CARD_WIDTH * 2 + CARD_GAP)) / 2;
const CARD_TOP = (HEIGHT - CARD_HEIGHT) / 2;

const JPEG_QUALITY = 85;

const samCache = new Map<string, string>();

async function samUri(samPath: string) {
	const cached = samCache.get(samPath);
	if (cached) return cached;

	const file = await readFile(samPath);
	const uri = `data:image/jpeg;base64,${file.toString('base64')}`;
	samCache.set(samPath, uri);
	return uri;
}

async function posterUri(id: string, samPath: string) {
	if (id === 'sam') {
		return samUri(samPath);
	}

	const response = await fetch(`${POSTER_BASE}/${id}.jpg`);
	if (!response.ok) {
		throw new Error(`TMDB poster fetch failed (${response.status}) for ${id}`);
	}

	const contentType = response.headers.get('content-type') ?? 'image/jpeg';
	const buffer = Buffer.from(await response.arrayBuffer());
	return `data:${contentType};base64,${buffer.toString('base64')}`;
}

function buildSvg(first: string, second: string) {
	return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient x1="0%" y1="45%" x2="100%" y2="55%" id="b">
      <stop stop-color="#202225" offset="0%"/>
      <stop stop-color="#000000" offset="100%"/>
    </linearGradient>
    <path id="a" d="M0 0h${WIDTH}v${HEIGHT}H0z"/>
    <filter id="blur" width="160%" height="160%" x="-30%" y="-30%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="50" result="blurred" />
      <feColorMatrix type="saturate" values="1.15"/>
    </filter>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur1"/>
      <feOffset in="blur1" dx="0" dy="3" result="offset1"/>
      <feFlood flood-color="rgba(0,0,0,0.18)" result="color1"/>
      <feComposite in="color1" in2="offset1" operator="in" result="shadow1"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blur2"/>
      <feOffset in="blur2" dx="0" dy="7" result="offset2"/>
      <feFlood flood-color="rgba(0,0,0,0.2)" result="color2"/>
      <feComposite in="color2" in2="offset2" operator="in" result="shadow2"/>
      <feMerge>
        <feMergeNode in="shadow2"/>
        <feMergeNode in="shadow1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="rounded">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="15" ry="15"/>
    </clipPath>
  </defs>
  <g fill="none" fill-rule="evenodd">
    <use fill="url(#b)" xlink:href="#a"/>
  </g>
  <g fill="none" fill-rule="evenodd" filter="url(#blur)" transform="rotate(2) scale(1.02)" transform-origin="center">
    <image href="${first}" width="50%" y="-25%" preserveAspectRatio="xMidYMid slice"/>
    <image href="${second}" width="50%" x="50%" y="-25%" preserveAspectRatio="xMidYMid slice"/>
  </g>
  <g fill="none" fill-rule="evenodd" style="filter: url(#shadow)">
    <g transform="translate(${CARD_LEFT}, ${CARD_TOP - 4}) rotate(-1)" clip-path="url(#rounded)">
      <image href="${first}" height="${CARD_HEIGHT}" width="${CARD_WIDTH}" />
    </g>
    <g transform="translate(${CARD_LEFT + CARD_WIDTH + CARD_GAP}, ${CARD_TOP + 6}) rotate(1)" clip-path="url(#rounded)">
      <image href="${second}" height="${CARD_HEIGHT}" width="${CARD_WIDTH}" />
    </g>
  </g>
</svg>`;
}

export async function renderCard(id: string, samPath: string): Promise<Buffer> {
	const [firstId, secondId, ...rest] = id.split('__');
	if (!firstId || !secondId || rest.length > 0) {
		throw new Error(`Invalid image id: ${id}`);
	}

	const [first, second] = await Promise.all([
		posterUri(firstId, samPath),
		posterUri(secondId, samPath)
	]);

	// Resvg only emits PNG; sharp does the JPEG encode.
	const png = new Resvg(buildSvg(first, second), {}).render().asPng();
	return await sharp(png).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
}
