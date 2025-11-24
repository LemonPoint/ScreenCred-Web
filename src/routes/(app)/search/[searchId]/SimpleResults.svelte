<script lang="ts">
	import type { SimpleComparison } from '$lib/server/comparison';
	import { mediaTitle, mediaTitleWithYear } from '$lib/utils';
	import type { MediaDetails } from '$lib/interfaces';
	import Credits from '$lib/components/Credits.svelte';

	interface Props {
		first: MediaDetails;
		second: MediaDetails;
		results: SimpleComparison;
	}

	const { first, second, results }: Props = $props();
	const person = first.mediaType === 'person' ? first : second;
	const media = first.mediaType !== 'person' ? first : second;
	const didWorkOn = results.crewCredits.length > 0 || results.castCredits.length > 0;
</script>

<div class="result">
	{#if didWorkOn}
		<p>
			<strong>{mediaTitle(person)}</strong> worked on <strong>{mediaTitleWithYear(media)}</strong>
		</p>
		<Credits castRoles={results.castCredits} crewRoles={results.crewCredits}></Credits>
	{:else}
		<p>
			<strong>{mediaTitle(person)}</strong> did not work on
			<strong>{mediaTitleWithYear(media)}</strong>
			{#if person.mediaType === 'person' && person.id === -1}
				<p>But he did make this app.</p>
			{/if}
		</p>
	{/if}
</div>

<style>
	.result {
		--_padding: 0.5rem;
		background: var(--uchu-yin-9);
		padding: var(--_padding);
		border-radius: var(--_padding);
		grid-column: span 2;
		display: grid;
		grid-template-columns: subgrid;
		gap: 1rem;
		position: relative;
		box-shadow: var(--shadow-2);
	}
</style>
