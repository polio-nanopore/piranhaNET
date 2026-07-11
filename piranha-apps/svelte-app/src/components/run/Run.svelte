<script lang="ts">
  import { piranhaAPI } from "$lib/piranhaAPI.svelte";
  import { appState } from "$lib/store.svelte";
  import RunParameters from "./RunParameters.svelte";
  import RunProgress from "./RunProgress.svelte";
  import Welcome from "./Welcome.svelte";
  import { Button } from "$lib/shadcn/ui/button";

  import { persistentSettingsStore } from "$lib/persistentSettingsStore";

  let needsFirstPersist = $state(!persistentSettingsStore.loadUserSettings());
  const onFirstPersist = (): void => {
    needsFirstPersist = false;
  };
</script>

<div class="container mx-auto p-4">
  {#if needsFirstPersist}
    <Welcome onpersist={onFirstPersist} />
  {:else if !piranhaAPI.running && !piranhaAPI.log.length}
    <RunParameters />
  {:else}
    <RunProgress />
  {/if}
</div>
