<script lang="ts">
  import {ParaglideMessage} from "@inlang/paraglide-js-svelte";
  import { m } from "../paraglide/messages";

  const {messageKey} = $props();
</script>

<ParaglideMessage
  message={m[messageKey]}
  inputs={{}}
>
  {#snippet link({ children, options })}
    <a href={options.to} target="_blank">
    {@render children?.()}
    </a>
  {/snippet}
</ParaglideMessage>
