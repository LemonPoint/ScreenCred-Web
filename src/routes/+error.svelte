<script lang="ts">
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import { resolve } from '$app/paths';
</script>

<div class="header-wrapper">
	<Header />
	<div class="content">
		<h2>{page?.error?.message}</h2>
		<a href={resolve('/')}>Home</a>
	</div>
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 3em;
	}

	a {
		color: white;
	}
</style>
