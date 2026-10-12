<script lang="ts">
  import {initialisePiranhaAPI, piranhaAPI} from "$lib/piranhaAPI/piranhaAPI.svelte.js";
  import { initialiseStore, isWeb } from "$lib/store.svelte";
  import AppRouter from "./components/AppRouter.svelte";

  const { mode, apiUrl } = $props();
  initialiseStore(mode, apiUrl);
  initialisePiranhaAPI();
</script>

<AppRouter/>

