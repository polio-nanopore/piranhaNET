import { mount } from "svelte";

import "../../../../svelte-app/src/assets/app.css";

import App from "../../../../svelte-app/src/App.svelte";

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
