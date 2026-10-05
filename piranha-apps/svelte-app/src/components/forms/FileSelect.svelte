<script lang="ts">
  import { Button } from "$lib/shadcn/ui/button";
  import { m } from "../../paraglide/messages";

  // TODO: add types for these
  let {
    mode,
    title,
    id,
    selectFolder,
    filters,
    onchange,
    value = $bindable(),
    fileListValue = $bindable()
  } = $props();

  let fileInput;

  const showElectronDialog = async (): Promise<void> => {
    const selected = await window.api.showFileDialog({
      title,
      selectFolder,
      filters,
      defaultPath: value,
    });
    if (selected !== null) {
      value = selected;
      if (onchange) {
        onchange();
      }
    }
  };

  const showWebDialog = () => {
    if (fileInput) {
      fileInput.click();
    }
  }

  const onWebDialogChange = (e) => {
    fileListValue = e.target.files;
    // string value for form validation and user feedback. We're using webkitdirectory so we don't get the folder name,
    // just the individual file entries. We can get the folder name from any entry's webkitRelativePath
    value = fileListValue.length ? fileListValue[0].webkitRelativePath.split("/")[0] : null;
    if (onchange) {
      onchange();
    }
  }

  const acceptExtensions = $derived(filters.flatMap((f) => f.extensions.map((e) => `.${e}`)));

  let placeholder = $derived(
    selectFolder ? m.formsNoFolderChosen() : m.formsNoFileChosen(),
  );
</script>

<div id={`${id}-container`} class="flex">
    <Button {id} class="rounded-r-none border-0"} onclick={mode == "electron" ? showElectronDialog : showWebDialog}
      >{selectFolder ? m.formsChooseFolder() : m.formsChooseFile()}</Button
    >
    {#if mode == "web"}
      {#if selectFolder}
        <input
          bind:this={fileInput}
          type="file"
          webkitdirectory
          directory
          on:change={onWebDialogChange}
          style="display: none"
        />
      {:else}
        <input
          bind:this={fileInput}
          type="file"
          accept={acceptExtensions.join(",")}
          on:change={onWebDialogChange}
          style="display: none"
        >
      {/if}
    {/if}
    <div
      data-testid={`${id}-value`}
      class="inline-block border border-input rounded-lg px-2.5 py-1 text-base w-full min-w-0 rounded-l-none border-l-0 text-sm font-light"
    >
      {value || placeholder}
    </div>
</div>
