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
  } = $props();

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

  const onWebDialogChange = (e) => {
    if (selectFolder) {
      value = e.target.files;
    } else {
      value = e.target.files.length ? e.target.files[0] : null;
    }
    if (onchange) {
      onchange();
    }
  }

  let placeholder = $derived(
    selectFolder ? m.formsNoFolderChosen() : m.formsNoFileChosen(),
  );

  let displayValue = $derived(
    mode == "electron" ?  value : (selectFolder ? value[0].name :  value.name)
  );
</script>

<div id={`${id}-container`} class="flex">
  <label>
    <Button {id} class="rounded-r-none border-0" onclick={mode == "electron" ? showElectronDialog : null}
      >{selectFolder ? m.formsChooseFolder() : m.formsChooseFile()}</Button
    >
    <div
      data-testid={`${id}-value`}
      class="inline-block border border-input rounded-lg px-2.5 py-1 text-base w-full min-w-0 rounded-l-none border-l-0 text-sm font-light"
    >
      {value ? displayValue : placeholder}
    </div>
    {#if mode == "web"}
      {#if selectFolder}
        <input
          type="file"
          webkitdirectory
          directory
          on:change={onWebDialogChange}
          style="display: none"
        />
      {:else}
        <input
          type="file"
          on:change={}
          accept="filters"
          on:change={onWebDialogChange}
          style="display: none"
        >
      {/if}
    {/if}
  </label>
</div>
