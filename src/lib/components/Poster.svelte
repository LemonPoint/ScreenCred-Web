<script lang="ts">
	import type { MediaDetails } from '$lib/interfaces';
	import { mediaImage, mediaTitle } from '$lib/utils';

	interface Props {
		media?: MediaDetails;
		size?: 185 | 500 | number;
	}

	const { media, size = 185 }: Props = $props();
</script>

<div class="poster" style:width={`${size}px`} style:border-radius={`${size * 0.15}px`}>
	{#if media}
		{@const image = mediaImage(media)}
		{#if image}
			<img src={image} alt={mediaTitle(media)} />
		{/if}
	{/if}
	<div class="placeholder">
		{#if media?.mediaType === 'movie'}
			<span>Movie</span>
		{:else if media?.mediaType === 'tv'}
			<span>TV</span>
		{:else if media?.mediaType === 'person'}
			<span>Person</span>
		{:else}
			<span>Search</span>
		{/if}
	</div>
</div>

<style>
	.poster {
		aspect-ratio: 2/3;
		overflow: hidden;
		background: aliceblue;
		position: relative;
		flex-shrink: 0;

		img {
			height: 100%;
			width: 100%;
			object-fit: cover;
			object-position: center;
		}

		.placeholder {
			position: absolute;
			inset: 0;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
