<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { MediaDetails } from '$lib/interfaces';
	import { mediaImage, mediaTitle } from '$lib/utils';

	interface Props {
		media?: MediaDetails;
		size?: 185 | 500 | number;
	}

	const { media, size = 185 }: Props = $props();
</script>

<div class="poster z-stack" style:width={`${size}px`} style:border-radius={`${size * 0.15}px`}>
	<div class="placeholder">
		{#if media?.mediaType === 'movie'}
			<span class="icon movie"></span>
		{:else if media?.mediaType === 'tv'}
			<span class="icon tv"></span>
		{:else if media?.mediaType === 'person'}
			<span class="icon person"></span>
		{:else}
			<span class="icon magnifying-glass"></span>
		{/if}
	</div>
	{#if media}
		{@const image = mediaImage(media)}
		{#if image}
			<img src={image} alt={mediaTitle(media)} transition:fade|global={{ duration: 200 }} />
		{/if}
	{/if}
</div>

<style>
	.poster {
		aspect-ratio: 2/3;
		overflow: hidden;
		border: 1px solid oklch(87.2% 0.01 258.338);
		background: oklch(96.7% 0.003 264.542);
		flex-shrink: 0;

		img {
			height: 100%;
			width: 100%;
			object-fit: cover;
			object-position: center;
		}

		.placeholder {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.icon {
			font-size: 2em;
			color: oklch(37.3% 0.034 259.733);
		}
	}
</style>
