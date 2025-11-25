<script>
	import '../styles/app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	let { children } = $props();
</script>

<div class="wrapper">
	<main>
		{@render children()}
	</main>

	<footer>
		<nav aria-label="footer">
			<ul>
				<li><a href={resolve('/(standalone)/privacy')}>Privacy</a></li>
				<li><a href={resolve('/(standalone)/about')}>About</a></li>
			</ul>
		</nav>
	</footer>
</div>

<style>
	.wrapper {
		min-height: 100vh;
		display: grid;
		grid-template-rows: 1fr min-content;
	}
	footer {
		padding-inline: var(--body-padding-inline);
		padding-block: 1rem;

		ul {
			display: flex;
			justify-content: flex-end;
			list-style: none;
			gap: 1rem;
		}

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
