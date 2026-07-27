<script lang="ts">
  import { Router, Route } from "svelte-tiny-router";
  import * as Tooltip from "$lib/shadcn/ui/tooltip";
  import Nav from "./components/nav/Nav.svelte";
  import Run from "./components/run/Run.svelte";
  import About from "./components/about/About.svelte";
  import { piranhaAPI } from "./lib/piranhaAPI.svelte.js";
  import { m } from "./paraglide/messages";
  import { i18n } from "./lib/i18n.svelte.js";
</script>

{#key i18n.lang}
  <Router>
    <Tooltip.Provider>
      <Nav></Nav>
      {#if piranhaAPI.initialized}
        <Route path="/" component={Run} />
        <Route path="/about" component={About} />
      {:else}
        <div class="container mx-auto p-4">
          {m.initializing()}...
        </div>
      {/if}
    </Tooltip.Provider>
  </Router>
{/key}
