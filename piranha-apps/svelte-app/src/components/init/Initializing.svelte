<script>
  import { m } from "../../paraglide/messages";
  import { piranhaAPI } from "../../lib/piranhaAPI.svelte.ts";
  import {X} from "@lucide/svelte";
  import {Spinner} from "../../lib/shadcn/ui/spinner";
</script>
<div class="container mx-auto p-4">
  <div class="justify-center text-xl mt-6">
    {#if piranhaAPI.error}
      <p class="flex">
        <X class="text-red-600 mr-4"></X>
        {piranhaAPI.error}
      </p>
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
