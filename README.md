# piranhaNET

Typescript user interface for [piranha](https://github.com/polio-nanopore/piranha) on desktop and web.

### :wrench: This is a work in progress. :wrench:

We will provide a Typescript front end for piranha, which can be built and distributed as an Electron application, 
or deployed as a web application. 

This repo contains the following components in its directories. See the READMEs in each directory for more details:

* `piranha-electron` - The Electron app - the source to be rendered in the app is to be found in `sveltekit-app`.
* `piranha-installer` - a [pyinstaller](https://pyinstaller.org) project for piranha allowing it to be bundled with the 
Electron app installer. 
* `sveltekit-app` - the source to be rendered in the Electron app. This is a [SvelteKit](https://svelte.dev/docs/kit) application. 

## Development

Production mode is still tbd. To run in dev mode, we first the sveltekit application on port 51367:
`npm run dev --prefix ./sveltekit-app`
Then, run the electron app, which points a browser window at that port:
`npm run dev --prefix ./piranha-electron`
