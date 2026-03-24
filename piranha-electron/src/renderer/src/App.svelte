<script lang="ts">
  import Versions from "./components/Versions.svelte";
  import piranhaLogo from "./assets/piranha.svg";
  import { Router, Route } from "svelte-tiny-router";
  import Nav from "./components/Nav.svelte";
  import Run from "./components/run/Run.svelte";
  import About from "./components/about/About.svelte";
  import {piranhaAPI} from "./lib/piranhaAPI.svelte";
  import {m} from "../../paraglide/messages";
  import {i18n} from "./lib/i18n.svelte";
</script>

{#key i18n.lang}
  <Router>
    <img alt="logo" class="logo" src={piranhaLogo} />
    <div class="text">PiranhaNET</div>
    <Nav></Nav>
    {#if piranhaAPI.error}
      <div class="error">Error: {piranhaAPI.error}</div>
    {/if}
    {#if piranhaAPI.initialized}

        <Route path="/run" component="{Run}" />
        <Route path="/about" component="{About}" />
        <Route>
          <p>
            No route loaded yet
          </p>
        </Route>

    {:else}
      {m.initializing()}...
    {/if}
  </Router>
{/key}
<Versions />
