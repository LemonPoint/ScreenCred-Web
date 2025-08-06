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
</script>

<p><strong>{mediaTitle(person)}</strong> worked on <strong>{mediaTitleWithYear(media)}</strong></p>
<Credits
	castRoles={results.castCredits.map((c) => c.role)}
	crewRoles={results.crewCredits.map((c) => c.role)}
></Credits>
