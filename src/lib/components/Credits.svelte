<script lang="ts">
	import type { ParsedCredit } from '$lib/interfaces';

	interface Props {
		castRoles: ParsedCredit[];
		crewRoles: ParsedCredit[];
	}

	const { castRoles, crewRoles }: Props = $props();
</script>

<div>
	{#if castRoles.length}
		<h3>Cast</h3>
		<ul>
			{#each castRoles as cast, index (index)}
				<li>
					{cast.role}
					{#if cast.modifiers && cast.modifiers.length > 0}
						<span class="modifiers">({cast.modifiers!.join(', ')})</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if crewRoles.length}
		<h3>Crew</h3>
		<ul>
			{#each crewRoles as crew, index (index)}
				<li>
					{crew.role}
					{#if crew.modifiers && crew.modifiers.length > 0}
						<span class="modifiers">({crew.modifiers.join(', ')})</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	h3 {
		color: var(--uchu-gray-6);
		text-transform: uppercase;
		font-weight: 500;
		font-size: 1em;
		margin-top: 1em;
	}

	ul {
		list-style-position: inside;
		padding: 0;
	}

	.modifiers {
		font-size: 0.8em;
		color: var(--uchu-gray-6);
	}
</style>
