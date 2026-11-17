<script lang="ts">
  import * as ansi_up from "ansi_up";
  import throttle from "throttleit";
  import { m } from "../../paraglide/messages";
  import { X, Check } from "@lucide/svelte";
  import { Button } from "$lib/shadcn/ui/button";
  import { Spinner } from "$lib/shadcn/ui/spinner";
  import { piranhaProvider } from "$lib/piranhaProvider/piranhaProvider.svelte";
  import { runParameters, settings, isWeb } from "$lib/store.svelte";
  import { PiranhaWebProvider } from "../../lib/piranhaProvider/piranhaWebProvider.svelte.js";

  let logEl;
  const ansi = new ansi_up.AnsiUp();

  const borderColour = $derived(
    piranhaProvider.running
      ? "border-orange-300"
      : piranhaProvider.error
        ? "border-red-600"
        : "border-green-600",
  );

  const scrollLogToEnd = throttle(() => {
    if (logEl) {
      logEl.scrollTop = logEl.scrollHeight;
    }
  }, 300);

  $effect(() => {
    if (piranhaProvider.log.length) {
      scrollLogToEnd();
    }
  });

  const clearRun = (): void => {
    piranhaProvider.clearRun();
  };

  const cancelRun = (): void => {
    piranhaProvider.cancelRun();
  };

  let downloading = $state(false);
  const downloadOutput = async (): Promise<void> => {
    downloading = true;
    await (piranhaProvider as PiranhaWebProvider).downloadOutputZip();
    downloading = false;
  };
</script>

<div data-testid="run-progress">{m.sequencingRunProgress()}</div>
<div class="space-y-2">
  <div class="bg-white mt-2 p-4 border {borderColour}">
    <div class="flex">
      <div class="font-bold pr-2">
        {runParameters.runName}
      </div>
      <div>
        {#if piranhaProvider.running}
          <Spinner class="text-orange-300" data-testid="run-progress-spinner"
          ></Spinner>
        {:else if piranhaProvider.error}
          <X class="text-red-600" data-testid="run-progress-x"></X>
        {:else}
          <Check class="text-green-600" data-testid="run-progress-check"
          ></Check>
        {/if}
      </div>
      {#if piranhaProvider.error}
        <div class="text-red-600 text-sm">
          {m[piranhaProvider.error.messageKey]()}: {piranhaProvider.error
            .detail}
        </div>
      {/if}
    </div>
    <div class="h-[2rem] flex items-center">
      <div>
        {m.parameterSamplesFile()}:
        <span class="font-bold">{runParameters.samplesFilePath}</span>
      </div>
    </div>
    <div class="h-[2rem] flex items-center">
      <div>
        {m.parameterMinKnowFolder()}:
        <span class="font-bold">{runParameters.minKnowFolderPath}</span>
      </div>
    </div>
    <div class="h-[2rem] flex items-center space-x-2">
      {#if !isWeb()}
        {m.settingOutputFolder()}:
        <span class="font-bold" data-testid="run-progress-output-folder"
          >{settings.outputFolderPath}</span
        >
      {/if}
      {#if piranhaProvider.runSucceeded}
        {#if isWeb()}
          <Button
            data-testid="download-output-zip"
            onclick={downloadOutput}
            disabled={downloading}>{m.downloadOutputZip()}</Button
          >
          {#if downloading}
            <Spinner class="text-orange-300" data-testid="downloading-spinner"
            ></Spinner>
          {/if}
          {#if piranhaProvider.downloadError}
            <div data-testid="download-error" class="text-red-600 text-sm">
              {m[piranhaProvider.downloadError.messageKey]()}: {piranhaProvider
                .downloadError.detail}
            </div>
          {/if}
        {:else}
          <Button
            data-testid="open-report"
            onclick={async () => await piranhaProvider.openRunReport()}
            >{m.openReport()}</Button
          >
          <Button
            data-testid="open-output-folder"
            onclick={async () => await piranhaProvider.openRunOutputFolder()}
            >{m.openOutputFolder()}</Button
          >
        {/if}
      {/if}
    </div>
    <code class="piranha-logs mt-2" data-testid="logs" bind:this={logEl}>
      {#each piranhaProvider.log as logentry, index (index)}
        <!-- eslint-disable  svelte/no-at-html-tags -->
        {@html ansi.ansi_to_html(logentry)}<br />
      {/each}
    </code>
  </div>
  {#if piranhaProvider.cancelling}
    <div class="float-end flex" data-testid="cancelling">
      <Spinner
        class="text-orange-300 size-6 mr-2"
        data-testid="cancelling-spinner"
      ></Spinner>
      {m.cancelling()}
    </div>
  {:else if !piranhaProvider.running}
    <Button class="action float-end" data-testid="new-run" onclick={clearRun}>
      {m.newRun()}
    </Button>
  {:else if !isWeb()}
    <Button
      class="action float-end bg-red-600"
      data-testid="cancel-run"
      onclick={cancelRun}
    >
      {m.cancelRun()}
    </Button>
  {/if}
</div>
