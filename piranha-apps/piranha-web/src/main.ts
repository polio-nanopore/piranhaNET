import { mount } from "svelte";
import App from "../../svelte-app/src/App.svelte";

// Mount a placeholder component for now, in future we will mount App
const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
