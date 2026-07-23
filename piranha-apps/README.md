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

#### Troubleshooting

You may see errors like this when running in dev on Ubuntu:

```
libEGL warning: failed to open /dev/dri/renderD129: Permission denied
```

I'm not sure why this happens, but re-installing the Nvidia EGL library fixed it on my machine:

```
sudo apt-get install libnvidia-egl-wayland1
```

This did not appear to be an issue when running with the app built in production mode.

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
Run integration tests with `npm run test:integration`.
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
