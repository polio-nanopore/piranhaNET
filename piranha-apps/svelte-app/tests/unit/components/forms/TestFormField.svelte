<script>
  import * as Tooltip from "$lib/shadcn/ui/tooltip";
  import FormField from "../../../../src/components/forms/FormField.svelte";

  let { error, help, class: className } = $props();
</script>

<Tooltip.Provider>
  <FormField label="Test Label" labelFor="test-input" {error} {help} class={className}>
    <input id="test-input" type="text" name="test-input" />
  </FormField>
</Tooltip.Provider>
