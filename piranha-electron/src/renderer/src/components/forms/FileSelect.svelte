<script>
  import { Button } from "$lib/shadcn/ui/button";
  import { m } from "../../../../paraglide/messages";

  let { title, selectFolder, filters, onchange, value = $bindable() } = $props();

  const showDialog = async () => {
    const selected = await window.api.showFileDialog({
      title,
      selectFolder,
      filters,
      defaultPath: value
    });
    if (selected !== null) {
      value = selected;
      if (onchange) {
        onchange();
      }
    }
  };

  let placeholder = $derived(selectFolder ? m.formsNoFolderChosen() : m.formsNoFileChosen());

</script>
<div class="flex">
  <Button class="rounded-r-none border-0" onclick={showDialog}>{ selectFolder ? m.formsChooseFolder() : m.formsChooseFile() }</Button>
  <div class="inline-block border border-input rounded-lg px-2.5 py-1 text-base w-full min-w-0 rounded-l-none border-l-0 text-sm font-light">
    {value || placeholder }
  </div>
</div>
