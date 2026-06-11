<script lang="ts">
  import { i18n } from "../../../src/lib/i18n.svelte.js";

  let { children } = $props();
</script>

{#key i18n.lang}
  {@render children()}
{/key}
