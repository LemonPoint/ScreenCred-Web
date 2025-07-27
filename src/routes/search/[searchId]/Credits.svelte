<script lang="ts">
	interface Props {
		castRoles: string[];
		crewRoles: string[];
	}

	const { castRoles, crewRoles }: Props = $props();
</script>

<div>
	{#if castRoles.length}
		<h3>Cast</h3>
		<ul>
			{#each castRoles as cast, index (index)}
				<li>{cast}</li>
			{/each}
		</ul>
	{/if}
	{#if crewRoles.length}<h3>Crew</h3>
		<ul>
			{#each crewRoles as crew, index (index)}
				<li>{crew}</li>
			{/each}
		</ul>
	{/if}
</div>
