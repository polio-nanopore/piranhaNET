import { mount } from "svelte";
import App from "../../svelte-app/src/App.svelte";

interface RuntimeConfig {
  apiUrl: string
}

const response = await fetch(
  `${import.meta.env.BASE_URL}config.json`,
  { cache: 'no-store' }
);

if (!response.ok) {
  throw new Error(`Could not load runtime configuration: ${response.status}`);
}

const config = (await response.json()) as RuntimeConfig;

if (!config.apiUrl) {
  throw new Error("apiUrl is missing from runtime configuration");
}

const app = mount(App, {
  target: document.getElementById("app")!,
  props:{
    mode: "web",
    apiUrl: config.apiUrl
  }
});

export default app;
