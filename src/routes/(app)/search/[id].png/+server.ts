import { redirect } from '@sveltejs/kit';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'fs/promises';

export async function GET({ params }) {
	const id = params.id;
	try {
		const buffer = await makeImage(id);

		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=604800'
			}
		});
	} catch (error) {
		console.log(error);
		// TODO: Make sure image exists for this
		return redirect(307, '/img/screencred_social.png');
	}
}

async function makeImage(id: string) {
	const imagePaths = id.split('__').map((id) => {
		return id === 'sam' ? 'sam' : `https://image.tmdb.org/t/p/w500/${id}.jpg`;
	});
	const [first, second] = await Promise.all(imagePaths.map(fetchPosterImage));

	const svg = `
<svg width="1230" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient x1="0%" y1="45%" x2="100%" y2="55%" id="b">
      <stop stop-color="#202225" offset="0%"/>
      <stop stop-color="#000000" offset="100%"/>
    </linearGradient>
    <path id="a" d="M0 0h1230v600H0z"/>
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
      <rect width="270" height="405" rx="15" ry="15"/>
    </clipPath>
  </defs>
  <g fill="none" fill-rule="evenodd" >
    <use fill="url(#b)" xlink:href="#a"/>
  </g>
  <g fill="none" fill-rule="evenodd" filter="url(#blur)" transform="rotate(2) scale(1.02)" transform-origin="center">
    <image href="${first}" width="50%" y="-25%" preserveAspectRatio="xMidYMid slice"/>
    <image href="${second}" width="50%" x="50%" y="-25%" preserveAspectRatio="xMidYMid slice"/>
  </g>
  <g fill="none" fill-rule="evenodd" style="filter: url(#shadow)">
    <g transform="translate(330, 92) rotate(-1)" clip-path="url(#rounded)">
      <image href="${first}" height="405" width="270" />
    </g>
    <g transform="translate(630, 102) rotate(1)" clip-path="url(#rounded)">
      <image href="${second}" height="405" width="270" />
    </g>
  </g>
</svg>`;
	const resvg = new Resvg(svg, {});
	const pngData = resvg.render();
	return pngData.asPng();
}

async function fetchPosterImage(path: string): Promise<string> {
	if (path === 'sam') {
		const arrayBuffer = await readFile('./static/img/sam.jpg');
		return bufferToBase64(arrayBuffer, 'image/jpeg');
	}
	const res = await fetch(path);
	const contentType = res.headers.get('content-type') || 'image/jpeg';
	const arrayBuffer = await res.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	return bufferToBase64(buffer, contentType);
}

function bufferToBase64(buffer: Buffer, contentType?: string) {
	const base64 = buffer.toString('base64');
	return `data:${contentType};base64,${base64}`;
}
