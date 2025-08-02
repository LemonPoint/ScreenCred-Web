<script lang="ts">
	import type { ComparisonState } from '$lib/store.svelte';
	import Poster from '$lib/components/Poster.svelte';
	import { mediaImage } from '$lib/utils';
	import type { MediaDetails } from '$lib/interfaces';

	interface Props {
		comparison: ComparisonState;
	}

	const { comparison }: Props = $props();
</script>

{#snippet poster(media: MediaDetails | undefined)}
	{#if media}
		{@const image = mediaImage(media)}
		{#if image}
			<img src={image} alt="" />
		{/if}
	{/if}
{/snippet}

<a href={`/search/${comparison.id}`}>
	<div class="z-stack comparison-card">
		<div class="background">
			{@render poster(comparison.first)}
			{@render poster(comparison.second)}
		</div>
		<div class="posters">
			{@render poster(comparison.first)}
			{@render poster(comparison.second)}
		</div>
		<div class="overlay">
			<div class="circle">
				<span class="icon plus"></span>
			</div>
		</div>
	</div>
</a>

<style>
	.comparison-card {
		width: 20vw;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 12%;
		scroll-snap-align: start;
		max-width: 200px;
	}

	.background {
		display: flex;

		img {
			width: 50%;
			object-fit: cover;
		}

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			backdrop-filter: blur(25px) saturate(150%);
		}
	}

	.posters {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 5%;

		> * {
			box-shadow:
				0 20px 25px -5px rgb(0 0 0 / 0.1),
				0 8px 10px -6px rgb(0 0 0 / 0.1);
			position: relative;
			height: 60%;
			border-radius: 4px;
		}

		> :first-child {
			top: -5%;
		}

		> :last-child {
			top: 5%;
		}
	}

	.overlay {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 2em;
		color: white;

		.circle {
			border-radius: 50%;
			height: 20%;
			aspect-ratio: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			overflow: hidden;
			box-shadow:
				0 20px 25px -5px rgb(0 0 0 / 0.1),
				0 8px 10px -6px rgb(0 0 0 / 0.1);

			&::before {
				content: '';
				position: absolute;
				inset: 0;
				backdrop-filter: blur(25px) saturate(150%);
			}
		}
	}
</style>
