<script>
  import { Button } from "$lib/shadcn/ui/button";
  import { m } from "../../paraglide/messages";
  import {appState} from "$lib/store.svelte";
  import { piranhaAPI } from "$lib/piranhaAPI.svelte";

  const clearRun = () => {
    piranhaAPI.clearRun();
  };
</script>

<Button class="action float-end" onclick={clearRun}>
  {m.newRun()}
</Button>
