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

## Architecture

PiranhaNET runs in two modes: Electron and Web. Both modes use the same [svelte](https://svelte.dev/) app front end to provide the user interface. 
While much of the front end functionality is shared between modes, the svelte app is implemented to accommodate the differences required by some aspects of 
running as a web electron front end.

Both modes need to run [Piranha](https://github.com/polio-nanopore/piranha), which is implemented as a Python command line tool, 
and provides a docker image for easy running.

![PiranhaNET Electron Architecture](/diagrams/PiranhaNET%20Electron%20architecture.drawio.png)

In Electron mode, PiranhaNET is a desktop [Electron](https://www.electronjs.org/) application which can be installed and 
run on Linux or Windows computers. The svelte app runs in Electron's renderer thread and communicates with the main thread 
for any functionality requiring native OS access, such as opening file dialogs or local files. Code in the main thread runs 
Piranha itself by starting its docker container for each run, bind mounting the container's volumes for input and output 
files at the locations selected by the user. The front end can then ask the main thread to open these local files directly, 
in the browser or native file explorer.

![PiranhaNET Web Architecture](/diagrams/PiranhaNET%20Web%20architecture.drawio.png)

In Web mode, the same svelte front end is deployed with a minimal piranha-web app wrapper (for bootstrapping) in a docker 
container. To run piranha, it communicates with PiranhaNET API. This is implemented in Python using FastAPI, and is deployed 
as a docker container which is based on Piranha's own container. It therefore has direct access to Piranha, which it runs as a subprocess.

To send input and output files between the front end and API, they are zipped in both directions. The svelte app zips input 
files to send to the API, which unzips and saves them locally in the container, passing this local path to Piranha on run. 
On run completion, the API zips the run's output folder which the svelte app downloads as a zipfile, which the user can subsequently 
unzip and browse.

When deployed, there will also be an nginx proxy container giving access to both the front end and API (not shown in the diagram).

Some details to note on the two modes:
- In both modes, Piranha output logs are streamed to the svelte front end and displayed to the user.
- There is an initialisation step. `initialiseStore` when the top level `App` is first mounted which determines the running mode, and all other setup. A utility method `isWeb` in the store is used throughout the svelte app to switch mode functionality as required.
- One key step in this initialisation is setting up the correct api class (either `PiranhaElectronAPI` or `PiranhaWebAPI`) which will be used to communicate with either the web API or Electron main thread.
- Some run settings are not relevant when running in web mode, as they relate to local output, e.g. the overwrite output checkbox. Settings types and validation are therefore slightly different between the modes.
- The `FileSelect` component is adapted to either handle opening native dialogs via the electron main thread, or standard web dialogs to select files and folders. When selecting the MinKnow folder, we need to know the internal folder structure so that we can assemble the archive with the structure retained (this is required to run Piranha), so we include the `webkitdirectory` attribute to provide this information. This shows a confirmation warning in the browser by default.
- Each mode shows a different UI to access results. In Electron mode, there are buttons to open the report in browser or open the output folder in native file explorer. In web mode, there is a button to download the output zip. The main report in the output zip file contains local links to other report files for the individual samples. These are relative links, and they work for the downloaded reports.

## Quick start
### Electron mode
Run `./scripts/run-electron`.

### Web mode
Run the API with: `./scripts/run-api`.
Run the web front end with: `./scripts/run-web`.


## Release process
To make a release:
1. Increment the version in `./piranha-apps/package.json`
2. Create a release in the github repository. Tag the release with a version which matches the package.json version, with a "v" prefix.
3. After the release has been created, the `PiranhaNET Installers` github action will run. Check that it completes successfully. When it has
done so, the installers should be attached to the release. Currently, we are only building the Windows installer.
4. If possible, download the installer to a Windows machine and check that PiranhaNET installs and runs correctly. 