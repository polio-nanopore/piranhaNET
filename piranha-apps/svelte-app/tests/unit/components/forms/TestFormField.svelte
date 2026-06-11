<script>
  import FormField from "../../../../src/components/forms/FormField.svelte";

  let { error, class: className } = $props();
</script>

<FormField label="Test Label" labelFor="test-input" {error} class={className}>
  <input id="test-input" type="text" name="test-input" />
</FormField>
