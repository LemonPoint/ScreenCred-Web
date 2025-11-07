<script>
	import '../styles/app.css';
	import { resolve } from '$app/paths';
	let { children } = $props();
</script>

<div class="wrapper">
	<main>
		{@render children()}
	</main>

	<footer>
		<ul>
			<li><a href={resolve('/(standalone)/privacy')}>Privacy</a></li>
		</ul>
	</footer>
</div>

<style>
	.wrapper {
		min-height: 100vh;
		display: grid;
		grid-template-rows: 1fr min-content;
	}
	footer {
		background-color: var(--uchu-yin-9);
		padding-inline: var(--body-padding-inline);
		padding-block: 1rem;

		a {
			color: white;
		}
	}

	main {
		max-width: 100vw;
	}

	footer {
		margin-top: 4rem;
	}
</style>
