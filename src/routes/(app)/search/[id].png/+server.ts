import { redirect } from '@sveltejs/kit';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-wasm';

export async function GET({ params }) {
	const id = params.id;
	try {
		const buffer = await makeImage(id);

		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': 'image/png'
			}
		});
	} catch (error) {
		console.log(error);
		// TODO: Make sure image exists for this
		return redirect(307, '/images/screencred_social.png');
	}
}

async function makeImage(id: string) {
	const [first, second] = id
		.replace(/\.png$/, '')
		.split('__')
		.map((id) => {
			// TODO: Update sam URL
			return id === 'sam' ? 'sam' : `https://image.tmdb.org/t/p/w500/${id}.jpg`;
		});

	const markup = html`<div
		style="display: flex; position: relative; height: 100%; width: 100%; background-image: linear-gradient(to right bottom, #202225, black);"
	>
		<div style="display: flex; width: 630px; height: 630px; margin-left: 285px;">
			<div
				style="display: flex; width: 50%; margin: auto 10px; border-radius: 10px; box-shadow: 0 3px 5px -2px hsl(220 3% 0% / 18%), 0 7px 14px -5px hsl(220 3% 0% / 20%)"
			>
				<img src="${first}" alt="" style="border-radius: 10px" />
			</div>

			<div
				style="display: flex; width: 50%; margin: auto 10px; border-radius: 10px; box-shadow: 0 3px 5px -2px hsl(220 3% 0% / 18%), 0 7px 14px -5px hsl(220 3% 0% / 20%)"
			>
				<img src="${second}" alt="" style="border-radius: 10px" />
			</div>
		</div>
	</div>`;
	const svg = await satori(markup, {
		width: 1200,
		height: 630,
		fonts: []
	});
	const resvg = new Resvg(svg);
	const pngData = resvg.render();
	return pngData.asPng();
}
