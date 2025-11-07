<script>
	import { resolve } from '$app/paths';
</script>

<header>
	<a href={resolve('/')}>
		<h1>ScreenCred</h1>
	</a>
</header>

<style>
	header {
		background-color: var(--uchu-yin-9);
		padding-inline: var(--body-padding-inline);
		padding-block: 1rem;

		a {
			color: white;
		}
	}
</style>
