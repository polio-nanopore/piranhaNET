<script lang="ts">
  import { Button } from "$lib/shadcn/ui/button";
  import { m } from "../../../../paraglide/messages";

  let {
    title,
    id,
    selectFolder,
    filters,
    onchange,
    value = $bindable(),
  } = $props();

  const showDialog = async (): Promise<void> => {
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

  let placeholder = $derived(
    selectFolder ? m.formsNoFolderChosen() : m.formsNoFileChosen(),
  );
</script>

<div id={`${id}-container`} class="flex">
  <Button {id} data-testid={id} class="rounded-r-none border-0" onclick={showDialog}
    >{selectFolder ? m.formsChooseFolder() : m.formsChooseFile()}</Button
  >
  <div
    data-testid={`${id}-value`}
    class="inline-block border border-input rounded-lg px-2.5 py-1 text-base w-full min-w-0 rounded-l-none border-l-0 text-sm font-light"
  >
    {value || placeholder}
  </div>
</div>
