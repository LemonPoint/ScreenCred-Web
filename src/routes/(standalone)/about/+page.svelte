<script>
	import sam from '$lib/assets/sam.jpeg';
	import tmdb from '$lib/assets/tmdb.svg';
</script>

<h2>About</h2>
<section>
	<img src={sam} alt="Sam Warnick" class="sam-profile" />
	<p>
		👋 Hi there! My name is Sam, and I've been building and tinkering with ScreenCred for a while
		now. ScreenCred originally started as an iOS app, but in an effort to make it accessible to more
		people, it is now only on the web. I love Oreos and sesame chicken.
	</p>
	<p>Thanks for checking out ScreenCred! I hope you enjoy using it!</p>
	<p>
		Find me on <a
			href="https://mastodon.social/@samwarnick"
			target="_blank"
			rel="noopener noreferrer">Mastodon</a
		>
		or <a href="mailto:sam@screencred.app">email me</a> if you have any questions or comments.
	</p>
</section>
<hr />
<section>
	<img src={tmdb} alt="The Movie Database Logo" class="tmdb-logo" />
	<p>
		This app would not be possible without <a
			href="https://www.themoviedb.org/"
			target="_blank"
			rel="noopener noreferrer">The Movie Database</a
		>
		and their
		<a
			href="https://developer.themoviedb.org/docs/getting-started"
			target="_blank"
			rel="noopener noreferrer">API</a
		>.
	</p>
</section>

<style>
	.sam-profile {
		max-width: 200px;
		border-radius: 20px;
		box-shadow: var(--shadow-2);
		margin-bottom: 1em;
		margin-inline: auto;
	}
	.tmdb-logo {
		max-width: 300px;
		margin-inline: auto;
		margin-bottom: 1em;
	}
</style>
