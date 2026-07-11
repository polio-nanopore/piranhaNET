<script lang="ts">
  import * as ansi_up from "ansi_up";
  import debounce from 'debounce';
  import { m } from "../../paraglide/messages";
  import { X, Check } from "@lucide/svelte";
  import { Button } from "$lib/shadcn/ui/button";
  import { Spinner } from "$lib/shadcn/ui/spinner";
  import { piranhaAPI } from "$lib/piranhaAPI.svelte";
  import { runParameters, settings, appState } from "$lib/store.svelte";
  import NewRunButton from "./NewRunButton.svelte";

  let logEl;
  const ansi = new ansi_up.AnsiUp();

  const borderColour = $derived(
    piranhaAPI.running
      ? "border-orange-300"
      : piranhaAPI.error
        ? "border-red-600"
        : "border-green-600",
  );

  const scrollLogToEnd = debounce(() => {
    if (logEl) {
      logEl.scrollTop = logEl.scrollHeight;
    }
  }, 1000);

  $effect(() => {
    if (piranhaAPI.log.length) {
      scrollLogToEnd();
    }
  });
</script>

<div data-testid="run-progress">{m.sequencingRunProgress()}</div>
<div class="space-y-2">
  <div class="bg-white mt-2 p-4 border {borderColour}">
    <div class="flex">
      <div class="font-bold pr-2">
        {runParameters.name}
      </div>
      <div>
        {#if piranhaAPI.running}
          <Spinner class="text-orange-300" data-testid="run-progress-spinner"
          ></Spinner>
        {:else if piranhaAPI.error}
          <X class="text-red-600" data-testid="run-progress-x"></X>
        {:else}
          <Check class="text-green-600" data-testid="run-progress-check"
          ></Check>
        {/if}
      </div>
    </div>
    <div>
      {m.parameterBarcodesFile()}:
      <span class="font-bold">{runParameters.barcodesFilePath}</span>
    </div>
    <div>
      {m.parameterMinKnowFolder()}:
      <span class="font-bold">{runParameters.minKnowFolderPath}</span>
    </div>
    <div>
      {m.settingOutputFolder()}:
      <span class="font-bold">{settings.outputFolderPath}</span>
      {#if piranhaAPI.runSucceeded}
        <Button onclick={async () => await piranhaAPI.openRunReport()}>{m.openReport()}</Button>
        <Button onclick={async () => await piranhaAPI.openRunOutputFolder()}>{m.openOutputFolder()}</Button>
      {/if}
    </div>
    <code class="piranha-logs mt-2" data-testid="logs" bind:this={logEl}>
      {#each piranhaAPI.log as logentry, index (index)}
        <!-- eslint-disable  svelte/no-at-html-tags -->
        {@html ansi.ansi_to_html(logentry)}<br />
      {/each}
    </code>
  </div>
  {#if !piranhaAPI.running}
    <NewRunButton/>
  {/if}
</div>
