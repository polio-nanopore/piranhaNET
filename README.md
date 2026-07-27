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
* `piranha-api` - Python API, used by both the electron and web applications. 


## Quick start
Run the API with: `./scripts/run-api`.

Run the Electron app with: `./scripts/run-electron`.

Run the web app with: `./scripts/run-web`.

## Release process
To make a release:
1. Increment the version in `./piranha-apps/package.json`
2. Create a release in the github repository. Tag the release with a version which matches the package.json version, with a "v" prefix.
3. After the release has been created, the `PiranhaNET Installers` github action will run. Check that it completes successfully. When it has
done so, the installers should be attached to the release. Currently, we are only building the Windows installer.
4. If possible, download the installer to a Windows machine and check that PiranhaNET installs and runs correctly. 