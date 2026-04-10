<script>
  import { Button } from "$lib/shadcn/ui/button";

  const { selectFolder } = $props();
  let selected = $state("");

  const showDialog = async () => {
    console.log("showing in front end")
    selected = await window.api.showFileDialog({
      selectFolder
    });
  };

  // TODO: translate button text
</script>
<Button  onclick={showDialog}>{ selectFolder ? "Choose folder" : "Choose File" }</Button>
<div>{selected || "nothing selected"}</div>
