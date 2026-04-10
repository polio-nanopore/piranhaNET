<script lang="ts">
  import { i18n } from "../../../../src/renderer/src/lib/i18n.svelte";

  let { children } = $props();
</script>

{#key i18n.lang}
  {@render children()}
{/key}
