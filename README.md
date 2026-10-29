# ScreenCred

A fairly standard SvelteKit project. It requires an API key from [The Movie DB](https://developer.themoviedb.org/docs/getting-started) and a Postgres database.

## Developing

Install dependencies with `bun install`, start a development server:

```sh
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

Build and run the production server with Bun:

```sh
bun run build
bun ./build
```

## Deploying

Maybe best to not ask, but, currently deployed with a homegrown system called [Deploybot-3000](https://samwarnick.com/blog/i-built-my-own-coolify-replacement-that-i-might-not-use/).
