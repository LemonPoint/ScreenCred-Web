<script lang="ts">
	import { comparison } from '$lib/store.svelte';
	import Poster from '$lib/components/Poster.svelte';
	import z from 'zod';
	import { page } from '$app/state';

	const schema = z.enum(['first', 'second']).nullable();
	const searchParams = $derived(page.url.searchParams);
	const forWhich = $derived.by(() => schema.parse(searchParams.get('for')));
</script>

<div class="media-selector">
	<a href="/search?for=first" class:focused={forWhich === 'first'}>
		<Poster media={comparison.first} />
	</a>
	<a
		href={!comparison.first ? '/search?for=first' : '/search?for=second'}
		class:focused={forWhich === 'second'}
	>
		<Poster media={comparison.second} />
	</a>
</div>

<style>
	@keyframes scaleDown {
		to {
			grid-template-rows: 150px;
		}
	}

	.media-selector {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 300px;
		justify-items: center;
		gap: 1rem;

		animation: scaleDown linear forwards;
		animation-timeline: scroll();
		animation-range: 100px 350px;
	}

	a {
		&:first-child {
			justify-self: end;
		}
		&:last-child {
			justify-self: start;
		}
	}

	a.focused :global(.poster) {
		--shadow-color: var(--uchu-blue-4-raw);
		--shadow-strength: 70%;
		box-shadow:
			0 0 3px 2px oklch(var(--shadow-color) / calc(var(--shadow-strength) + 3%)),
			0 0 5px 5px oklch(var(--shadow-color) / calc(var(--shadow-strength) + 5%));
	}
</style>
