<script lang="ts">
  import { initialisePiranhaProvider } from "$lib/piranhaProvider/piranhaProvider.svelte.js";
  import { initialiseStore } from "$lib/store.svelte";
  import AppRouter from "./components/AppRouter.svelte";

  const { mode, apiUrl } = $props();
  initialiseStore(mode, apiUrl);
  initialisePiranhaProvider();
</script>

<AppRouter />
