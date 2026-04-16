<script>
  import { Button } from "$lib/shadcn/ui/button";

  let { titleKey, selectFolder, value = $bindable() } = $props();

  const showDialog = async () => {
    const selected = await window.api.showFileDialog({
      titleKey,
      selectFolder,
      defaultPath: value
    });
    if (selected !== null) {
      value = selected;
    }
  };

  let placeholder = $derived(selectFolder ? "No folder chosen" : "No file chosen");

  // TODO: translate titles
  // TODO: translate button & placeholder text
  // TODO: Make accessible
</script>
<div class="flex">
  <Button class="rounded-r-none border-0" onclick={showDialog}>{ selectFolder ? "Choose folder" : "Choose File" }</Button>
  <div class="inline-block border border-input rounded-lg px-2.5 py-1 text-base w-full min-w-0 rounded-l-none border-l-0 text-sm font-light">
    {value || placeholder }
  </div>
</div>
