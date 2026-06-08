# piranhaNET
Typescript user interface for [piranha](https://github.com/polio-nanopore/piranha) on desktop and web.

### :wrench: This is a work in progress. :wrench:

We will provide a Typescript front end for piranha, which can be built and distributed as an [Electron](https://www.electronjs.org/)
application, or deployed as a web application.

This monorepo contains the following components in its directories.

* `piranha-apps` - npm root and source for both the Electron and web applications, containing the following notable sub-directories:
  * `svelte-app` - the front end svelte application code used by both applications
  * `piranha-electron` - the electron wrapper for `svelte-app`. Its vite config file is `electron.vite.config.ts`.
  * `piranha-web` - the web app wrapper for `svelte-app`. Its vite config file is `web.vite.config.ts`.

## Quick start

Run the Electron app with: `./scripts/run-electron`.

Run the web app with: `./scripts/run-web`.
