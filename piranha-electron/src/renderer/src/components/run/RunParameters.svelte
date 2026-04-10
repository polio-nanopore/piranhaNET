<script lang="ts">
  import {z} from "zod";
  import {Input} from "$lib/shadcn/ui/input";
  import FormField from "../forms/FormField.svelte";

  const formSchema = z.object({
    name: z.string().nonempty(),
    barcodesFile: z.string().nonempty(),
    minKnowFolder: z.string().nonempty(),
    notes: z.string().optional(),
    analysisThreads: z.number().min(1).max(20)
  });

  // TODO: This should be in a store so we can reload it on language change etc
  let formData = $state({
    name: "",
    barcodesFile: "",
    minKnowFolder: "",
    notes: "",
    analysisThreads: 10
  });

  let errors = $state<Record<string, string[]>>({});

  let enableRun = $state(false);

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      errors = result.error.flatten().fieldErrors;
      enableRun = false;
    } else {
      errors = {};
      console.log("Submit:", result.data);
      enableRun = true;
    }
  }

  // TODO: translations!
  // TODO: move run button here and turn it into type=submit. Enable and disable on update
</script>
<form onsubmit={onSubmit}>
  <FormField label="name" error={errors.name}>
    <Input bind:value={formData.name}></Input>
  </FormField>
  <FormField label="barcodesFile" error={errors.barcodesFile}>
    <Input bind:value={formData.barcodesFile}></Input>
  </FormField>
  <FormField label="minKnowFolder" error={errors.minKnowFolder}>
    <Input bind:value={formData.minKnowFolder}></Input>
  </FormField>
  <FormField label="notes" error={errors.notes}>
    <Input bind:value={formData.notes}></Input>
  </FormField>
  <FormField label="analysisThreads" error={errors.analysisThreads}>
    <Input type="number" bind:value={formData.analysisThreads}></Input>
  </FormField>
</form>
