<script lang="ts">
  import { ParaglideMessage } from "@inlang/paraglide-js-svelte";
  import { m } from "../paraglide/messages";

  const { messageKey } = $props();
</script>

<div>
  <ParaglideMessage message={m[messageKey]} inputs={{}}>
    {#snippet link({ children, options })}
      <!-- eslint-disable svelte/no-navigation-without-resolve -->
      <a href={options.to} target="_blank" class="text-blue-600">
        {@render children?.()}
      </a>
    {/snippet}
  </ParaglideMessage>
</div>
