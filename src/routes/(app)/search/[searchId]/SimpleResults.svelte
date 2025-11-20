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

{#if didWorkOn}
	<p>
		<strong>{mediaTitle(person)}</strong> worked on <strong>{mediaTitleWithYear(media)}</strong>
	</p>
	<Credits castRoles={results.castCredits} crewRoles={results.crewCredits}></Credits>
{:else}
	<p>
		<strong>{mediaTitle(person)}</strong> did not on <strong>{mediaTitleWithYear(media)}</strong>
	</p>
{/if}
