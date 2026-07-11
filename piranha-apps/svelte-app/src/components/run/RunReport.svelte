<script>
  import { Button } from "$lib/shadcn/ui/button";
  import { m } from "../../paraglide/messages";
  import {appState} from "$lib/store.svelte";
  import { piranhaAPI } from "$lib/piranhaAPI.svelte";
  import NewRunButton from "./NewRunButton.svelte";
  import {onMount} from "svelte";

  let testUrl = $state("")
  onMount( async () => {
    testUrl = await piranhaAPI.getFileUrl("/home/emmarussell/dev/piranhaNET/test-results/piranha_output_171/report.html");
  });

</script>

<div data-testid="run-report">{m.runReport()}</div>

<NewRunButton/>
<Button onclick={() => appState.viewRunReport = false}>{m.viewLogs()}</Button>
<div>
  This is the run report: {testUrl}
  {#if testUrl}
    <iframe
      class="w-full"
      title={m.runReport()}
      src="app://%2Fhome%2Femmarussell%2Fdev%2FpiranhaNET%2Ftest-results%2Fpiranha_output_171%2Freport.html"
    ></iframe>
  {/if}
</div>
