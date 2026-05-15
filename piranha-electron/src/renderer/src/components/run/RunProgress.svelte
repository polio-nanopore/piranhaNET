<script lang="ts">
  import * as ansi_up from "ansi_up";
  import { m } from "../../../../paraglide/messages";
  import { Button } from "$lib/shadcn/ui/button";
  import { piranhaAPI } from "$lib/piranhaAPI.svelte";

  const ansi = new ansi_up.AnsiUp();
</script>

<div data-testid="run-progress">{m.sequencingRunProgress()}</div>
<div class="space-y-2">
  <code class="piranha-logs mt-2" data-testid="logs">
    {#each piranhaAPI.log as logentry, index (index)}
      <!-- eslint-disable  svelte/no-at-html-tags -->
      {@html ansi.ansi_to_html(logentry)}<br />
    {/each}
  </code>
  {#if !piranhaAPI.running}
    <Button class="action float-end" onclick={() => piranhaAPI.clearLog()}
      >{m.newRun()}</Button
    >
  {/if}
</div>
