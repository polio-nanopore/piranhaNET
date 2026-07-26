<script>
  import { m } from "../../paraglide/messages";
  import { piranhaAPI } from "../../lib/piranhaAPI.svelte.ts";
  import {X} from "@lucide/svelte";
  import {Spinner} from "../../lib/shadcn/ui/spinner";
  import I18nMessageWithLinks from "../I18nMessageWithLinks.svelte";
</script>
<div class="container mx-auto p-4">
  <div class="justify-center text-xl mt-6">
    {#if piranhaAPI.error}
      <p class="flex">
        <X class="text-red-600 mr-4"></X>
        <I18nMessageWithLinks messageKey={piranhaAPI.error.messageKey}></I18nMessageWithLinks>
      </p>
      {#if piranhaAPI.error.detail}
        <p class="mt-5">
          {m.errorDetail()}: {piranhaAPI.error.detail}
        </p>
      {/if}
      <p class="mt-5">
        {m.initErrorRestart()}
      </p>
    {:else}
      <p class="flex">
        <Spinner class="text-orange-300 size-8 mr-4"></Spinner>
        {m.initializing()}...
      </p>
    {/if}
  </div>
</div>
