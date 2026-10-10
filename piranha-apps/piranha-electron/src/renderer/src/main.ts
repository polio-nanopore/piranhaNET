import { mount } from "svelte";

import App from "../../../../svelte-app/src/App.svelte";

const app = mount(App, {
  target: document.getElementById("app")!,
  props:{
    mode: "electron",
    apiUrl: null
  }
});

export default app;
