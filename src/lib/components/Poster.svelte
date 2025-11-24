<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { MediaDetails } from '$lib/interfaces';
	import { mediaImage, mediaTitle } from '$lib/utils';

	interface Props {
		media?: MediaDetails;
		disabled?: boolean;
	}

	const { media, disabled }: Props = $props();
</script>

<div class="poster-wrapper" class:disabled>
	<div class="poster z-stack">
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
</div>

<style>
	.poster-wrapper {
		container-type: inline-size;
		width: 100%;
		aspect-ratio: 2/3;
	}

	.disabled {
		/*filter: grayscale(1);*/
	}

	.poster {
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--uchu-yin-9);
		color: var(--uchu-gray-4);
		border-radius: 5cqmin;
		box-shadow: var(--shadow-2);
	}

	.disabled .poster img {
		filter: blur(1px);
	}

	.disabled .poster::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: linear-gradient(to top, var(--uchu-blue-9), var(--uchu-blue-4));
		opacity: 0.8;
	}

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
		font-size: 25cqmin;
	}
</style>
