<script lang="ts">
  import { Button } from "$lib/shadcn/ui/button";
  import { m } from "../../../../paraglide/messages";
  import * as ansi_up from "ansi_up";
  import { piranhaAPI } from "$lib//piranhaAPI.svelte";

  const ansi = new ansi_up.AnsiUp();
</script>

<div class="container mx-auto p-4">
  <div data-testid="welcome">{m.welcome()}</div>
  <div class="actions">
    <Button
      class="action"
      onclick={() => piranhaAPI.runPiranha()}
      data-testid="run">{m.runPiranha()}</Button
    >
  </div>
  <div>
    <code class="piranha-logs" data-testid="logs">
      {#each piranhaAPI.log as logentry, index (index)}
        <!-- eslint-disable  svelte/no-at-html-tags -->
        {@html ansi.ansi_to_html(logentry)}<br />
      {/each}
    </code>
  </div>
  <Button
    class="action"
    onclick={() => piranhaAPI.testMessageMain()}
    data-testid="test-msg"
  >
    {m.testMessageMain()}
  </Button>
</div>
