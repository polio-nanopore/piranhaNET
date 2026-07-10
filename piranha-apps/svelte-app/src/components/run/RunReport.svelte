<script>
  import { Button } from "$lib/shadcn/ui/button";
  import { m } from "../../paraglide/messages";
  import {appState} from "$lib/store.svelte";
  import { piranhaAPI } from "$lib/piranhaAPI.svelte";
  import NewRunButton from "./NewRunButton.svelte";
</script>

<div data-testid="run-report">{m.runReport()}</div>

<NewRunButton/>
<Button onclick={() => appState.viewRunReport = false}>{m.viewLogs()}</Button>
<div>
  This is the run report: {piranhaAPI.reportPath}
  <iframe
    title={m.runReport()}
    src={piranhaAPI.reportPath}
  ></iframe>
</div>
