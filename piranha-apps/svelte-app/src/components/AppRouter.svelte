<script>
  import { Router, Route } from "svelte-tiny-router";
  import * as Tooltip from "$lib/shadcn/ui/tooltip";
  import Nav from "./nav/Nav.svelte";
  import Run from "./run/Run.svelte";
  import About from "./about/About.svelte";
  import Initializing from "./init/Initializing.svelte";
  import { piranhaAPI } from "$lib/piranhaAPI/piranhaAPI.svelte.js";
  import { isWeb } from "$lib/store.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
</script>

{#key i18n.lang}
  <Router>
    <Tooltip.Provider>
      <Nav></Nav>
      {#if isWeb() || piranhaAPI.initialized}
        <Route path="/" component={Run} />
        <Route path="/about" component={About} />
      {:else}
        <Initializing></Initializing>
      {/if}
    </Tooltip.Provider>
  </Router>
{/key}
