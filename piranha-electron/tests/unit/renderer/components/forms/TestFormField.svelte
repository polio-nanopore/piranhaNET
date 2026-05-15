<script>
  import FormField from "../../../../../src/renderer/src/components/forms/FormField.svelte";

  let { error } = $props();
</script>

<FormField label="Test Label" labelFor="test-input" {error}>
  <input id="test-input" type="text" name="test-input" />
</FormField>
