<script>
	import '../styles/app.css';
	let { children } = $props();
</script>

<header>
	<a href="/">
		<h1>ScreenCred</h1>
	</a>
</header>

{@render children()}

<footer>
	<ul>
		<li><a href="/privacy">Privacy</a></li>
	</ul>
</footer>

<style>
	header,
	footer {
		background-color: var(--uchu-yin-9);
		box-shadow: var(--shadow-3);
		padding-inline: var(--body-padding-inline);
		padding-block: 1rem;

		a {
			color: white;
		}
	}

	footer {
		margin-top: 4rem;
	}
</style>
