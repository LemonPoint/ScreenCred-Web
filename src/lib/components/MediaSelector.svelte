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
		display: flex;
		gap: 1rem;
	}

	a {
		width: 200px;
	}
</style>
