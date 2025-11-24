<script>
	import '../styles/app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	let { children } = $props();
</script>

<svelte:head>
	<meta property="og:title" content="ScreenCred" />
	<meta
		property="og:description"
		content="Find the connections between movies, shows, and the people who make them."
	/>
	<meta property="og:image" content="/img/screencred_social.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="/img/screencred_social.png" />
	<meta name="twitter:title" content="ScreenCred" />
	<meta
		name="twitter:description"
		content="Find the connections between movies, shows, and the people who make them."
	/>
</svelte:head>

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
