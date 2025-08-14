<script lang="ts">
	import { comparison } from '$lib/store.svelte';
	import Poster from '$lib/components/Poster.svelte';
</script>

<div class="media-selector">
	<a href="/search?for=first">
		<Poster media={comparison.first} />
	</a>
	<a href="/search?for=second">
		<Poster media={comparison.second} />
	</a>
</div>

<style>
	.media-selector {
		display: grid;
		grid-template-columns: 1fr 1fr;
		justify-items: center;
		gap: 1rem;
		max-width: 400px;
	}

	a {
		/* width: min(200px, calc(50vw - 1rem - (var(--body-padding-inline) * 2))); */
		width: 100%;
	}
</style>
