<script lang="ts">
  import { initialisePiranhaAPI } from "$lib/piranhaAPI/piranhaAPI.svelte.js";
  import { initialiseStore } from "$lib/store.svelte";
  import AppRouter from "./components/AppRouter.svelte";

  const { mode, apiUrl } = $props();
  initialiseStore(mode, apiUrl);
  initialisePiranhaAPI();
</script>

<AppRouter />
