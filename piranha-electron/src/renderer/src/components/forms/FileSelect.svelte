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

  // TODO: translate titles
  // TODO: translate button text
  // TODO: Make accessible
</script>
<Button  onclick={showDialog}>{ selectFolder ? "Choose folder" : "Choose File" }</Button>
<span>{value}</span>
