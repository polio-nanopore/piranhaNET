<script lang="ts">
  import { Router, Route } from "svelte-tiny-router";
  import Nav from "./components/nav/Nav.svelte";
  import Run from "./components/run/Run.svelte";
  import About from "./components/about/About.svelte";
  import { piranhaAPI } from "./lib/piranhaAPI.svelte.js";
  import { m } from "./paraglide/messages";
  import { i18n } from "./lib/i18n.svelte.js";
</script>

{#key i18n.lang}
  <Router>
    <Nav></Nav>
    {#if piranhaAPI.initialized}
      <Route path="/" component={Run} />
      <Route path="/about" component={About} />
    {:else}
      <div class="container mx-auto p-4">
        {m.initializing()}...
      </div>
    {/if}
  </Router>
{/key}
