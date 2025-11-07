<script>
	import { resolve } from '$app/paths';
</script>

<header>
	<a href={resolve('/')}>
		<h1><span class="icon logo" style="--icon-size: 2em"></span>ScreenCred</h1>
	</a>
</header>

<style>
	header {
		background-color: var(--uchu-yin-9);
		padding-inline: var(--body-padding-inline);

		h1 {
			display: flex;
			align-items: center;
			gap: 1rem;
			line-height: 1;
			font-weight: 500;
			font-size: 1.5rem;
		}

		a {
			color: white;
			text-decoration: none;
		}
	}
</style>
