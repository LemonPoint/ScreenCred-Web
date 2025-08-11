<script lang="ts">
	import type { MediaDetails } from '$lib/interfaces';
	import type { ComparisonState } from '$lib/store.svelte';
	import { mediaImage } from '$lib/utils';

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
	a {
		width: clamp(150px, 40vw, 200px);
		display: block;
		container-type: inline-size;
	}

	.comparison-card {
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 10cqmin;
		scroll-snap-align: start;
		max-width: 100%;
		box-shadow: var(--shadow-2);
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
			backdrop-filter: blur(25px) saturate(110%);
		}
	}

	.posters {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 5%;

		> * {
			box-shadow: var(--shadow-2);
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
		color: hsl(0 0% 100% / 90%);

		.circle {
			border-radius: 50%;
			height: 20%;
			aspect-ratio: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			overflow: hidden;
			box-shadow: var(--shadow-2);

			&::before {
				content: '';
				position: absolute;
				inset: 0;
				backdrop-filter: blur(25px) saturate(150%);
			}
		}
	}
</style>
