# piranha-apps

A [Svelte](https://svelte.dev/) app written in [TypeScript](https://www.typescriptlang.org/) which enables desktop users to run [piranha](https://github.com/polio-nanopore/piranha).

This app can be run both within an [Electron](https://www.electronjs.org/svelte) application and as a web application.

Source code is contained in the following folders:
`svelte-app` - the shared Svelte application
`piranha-electron` - the Electron app
`piranha-web` - the web app

## Project Setup

### Install dependencies

```bash
$ npm install
```

### Development

Run Electron app:

```bash
$ npm run dev-electron
```

Run web app:

```bash
$ npm run dev-web
```

#### Test data

There is some useful test data to help with manual local testing in the `test-data` folder (under project root). This
contains two folder with data files which can be used to run Piranha:

- multiple_samples: This contains data for seven samples which can be used to replicate a typical size of Piranha run. However.
  this data is in an older format and missing some metadata, so Piranha will log some warnings.
- new_format: This contains data for a single sample in the new format with all expeced metadata.

Each folder contains a "barcodes.csv" file. Select this file as the "Barcodes file" parameter.
Each folder also contains a single subfolder called "minknow". Select this subfolder as the "MinKnow folder" parameter.
Select barcodes file and MinKnow folder from the same test_data folder on each run.

The other settings and parameters can typically take any text (e.g. for run Name and Notes), or can be selected from
drop down lists or checkboxes. See the inline help for descriptions of what each setting means.

#### Troubleshooting

##### libEGL warning

You may see errors like this when running in dev on Ubuntu:

```
libEGL warning: failed to open /dev/dri/renderD129: Permission denied
```

I'm not sure why this happens, but re-installing the Nvidia EGL library fixed it on my machine:

```
sudo apt-get install libnvidia-egl-wayland1
```

This did not appear to be an issue when running with the app built in production mode.

##### SUID sandbox error

Another error that may occur on set-up on Ubuntu 24.04 looks like this:

```
[<some numbers here>:FATAL:sandbox/linux/suid/client/setuid_sandbox_host.cc:166] The SUID sandbox helper binary was found, but is not configured correctly. Rather than run without sandboxing I'm aborting now. You need to make sure that /home/dmears/projects/polio-nanopore/piranhaNET/piranha-apps/node_modules/electron/dist/chrome-sandbox is owned by root and has mode 4755.
```

This can be addressed by following [this comment](https://github.com/electron/electron/issues/42510#issuecomment-2171583086)'s advice to first lift a restriction introduced by Ubuntu 24.04, and you should probably reset that setting once you have successfully started the app:

```sh
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

Afterwards:

```sh
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=1
```

### Internationalisation

Internationalisation in the renderer is implemented using [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs).
To add a UI string, add it in English (en), French (fr) and Portuguese (pt), with the same key, to the relevant json files
in the `messages` folder. After an `npm run build` that key will be available as a method on `m` which can be
imported from `src/paraglide/messages`.

The `i18n` object defined in `renderer/src/lib/i18n.svelte.ts` allows reading and writing the current language which is
a svelte `$state` value. To make a message string in the UI reactive to language change, it should be included in a
key block tied to that value:

```
{#key i18n.lang}
...
   { m.whatever() }
...
{/key}
```

`i18n` also provides an array of `allLanguages`, which it reads from Paraglide.

### UI Components

We're using [shadcn-svelte](https://www.shadcn-svelte.com) for components. Default components are added to the project
manually as needed e.g. `npx shadcn-svelte@latest add button`. See the [installation instructions](https://www.shadcn-svelte.com/docs/installation/manual)
for more details.

However, the shadcn svelte Form component is heavily tied to SvelteKit via `sveltekit-superforms` so we're making our own forms.

### Tests

Run unit tests with `npm run test:unit`.
Run integration tests with `npm run test:electron-integration`.
Run unit and integration tests with coverage using `npm run coverage`

Run Playwright e2e tests with `npm run test:e2e`.

In order to run the Playwright tests on GitHub Actions, the `test:e2e` script uses xvfb, a virtual display for use on
systems without a default display driver. See [here](https://www.electronjs.org/docs/latest/tutorial/testing-on-headless-ci) for more details.

The `test:e2e` script also pre-builds the app, as Playwright needs to use a built js application, not Typescript directly.

To see additional logging during the e2e tests, you can switch on debug logging by changing the `test-electron:e2e` script to:
`electron-vite piranha-electron/build && DEBUG=pw:api xvfb-run npx playwright test`

### Lint

Run lint without making changes: `npm run lint`
Run lint and make automatic fixes: `npm run lint:fix`

## Formatting

Run formatting check without making changes: `npm run format:check`
Run formatting with automatic fixes: `npm run format:write`

### Build

Build distributions of the app with:

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
