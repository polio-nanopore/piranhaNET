<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import logo from '$lib/images/piranha-logo.svg';
</script>

<header>
	<div class="corner">
		<a href="https://svelte.dev/docs/kit">
			<img src={logo} alt="SvelteKit" />
		</a>
	</div>

	<nav>
		<ul>
			<li aria-current={page.url.pathname === '/' ? 'page' : undefined}>
				<a href={resolve('/')}>Run</a>
			</li>
			<li aria-current={page.url.pathname.startsWith('/history') ? 'page' : undefined}>
				<a href={resolve('/history')}>History</a>
			</li>
			<li aria-current={page.url.pathname === '/about' ? 'page' : undefined}>
				<a href={resolve('/about')}>About</a>
			</li>
		</ul>
	</nav>
</header>

<style>
	header {
		display: flex;
		background-color: #19434c; /* TODO: make this a theme color */
		height: 3.5rem;
	}

	.corner {
		width: 5rem;
		height: 5rem;
		margin-left: 0.5rem;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding-top: 0.2rem;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1.2rem;
		color: var(--color-text-light);
		font-weight: 700;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover, li[aria-current="page"] a {
		color: var(--color-theme-1);
	}
</style>
