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
