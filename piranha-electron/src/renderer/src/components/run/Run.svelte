<script lang="ts">
  import { piranhaAPI } from "$lib//piranhaAPI.svelte";
  import RunParameters from "./RunParameters.svelte";
  import RunProgress from "./RunProgress.svelte";
</script>

<div class="container mx-auto p-4">
  {#if !piranhaAPI.running && !piranhaAPI.log.length}
    <RunParameters />
  {:else}
    <RunProgress />
  {/if}
</div>
