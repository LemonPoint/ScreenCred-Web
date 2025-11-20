<script lang="ts">
	import { resolve } from '$app/paths';
	import logo from '$lib/assets/screencred.svg';
</script>

<header>
	<a href={resolve('/')}>
		<h1><img alt="ScreenCred TV logo" src={logo} />ScreenCred</h1>
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

			img {
				height: 2rem;
				margin-block: 0.5rem;
			}
		}

		a {
			color: white;
			text-decoration: none;
		}
	}
</style>
