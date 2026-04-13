<script lang="ts">
  import {z} from "zod";
  import { m } from "../../../../paraglide/messages";
  import {Button} from "$lib/shadcn/ui/button";
  import {Input} from "$lib/shadcn/ui/input";
  import FormField from "../forms/FormField.svelte";
  import {runParameters, settings} from "../../lib/store.svelte";
  import {createPiranhaRunOptions} from "../../types";
  import {piranhaAPI} from "../../lib/piranhaAPI.svelte";
  import FileSelect from "../forms/FileSelect.svelte";

  const formSchema = z.object({
    name: z.string().nonempty(),
    barcodesFilePath: z.string().nonempty(),
    minKnowFolderPath: z.string().nonempty(),
    outputFolderPath: z.string().nonempty(),
    notes: z.string().optional(),
    threads: z.number().min(1).max(20)
  });

  let errors = $state<Record<string, string[]>>({});

  let enableRun = $state(false);

  function onSubmit(e: SubmitEvent) {
    console.log("submitting")
    e.preventDefault();
    const result = formSchema.safeParse(runParameters);
    console.log("Submit:", result);
    if (!result.success) {
      console.log("submit failed")
      errors = result.error.flatten().fieldErrors;
      enableRun = false;
    } else {
      errors = {};
      const runOptions = createPiranhaRunOptions(runParameters, settings);
      piranhaAPI.runPiranha(runOptions);
      enableRun = true;
    }
  }

  // TODO: translations!
  // TODO:Enable and disable button on update
</script>
<form onsubmit={onSubmit}>
  <FormField label="name" error={errors.name}>
    <Input bind:value={runParameters.name}></Input>
  </FormField>
  <FormField label="barcodesFilePath" error={errors.barcodesFilePath}>
    <!--<Input bind:value={runParameters.barcodesFilePath}></Input>-->
    <FileSelect title="barcodesFile" selectFolder={false} bind:value={runParameters.barcodesFilePath}></FileSelect>
  </FormField>
  <FormField label="minKnowFolderPath" error={errors.minKnowFolderPath}>
    <!--<Input bind:value={runParameters.minKnowFolderPath}></Input>-->
    <FileSelect title="minKnowFolder" selectFolder={true} bind:value={runParameters.minKnowFolderPath}></FileSelect>
  </FormField>
  <FormField label="outputFolderPath" error={errors.minKnowFolderPath}>
    <!--<Input bind:value={runParameters.outputFolderPath}></Input>-->
    <FileSelect title="outputFolder" selectFolder={true} bind:value={runParameters.outputFolderPath}></FileSelect>
  </FormField>
  <FormField label="notes" error={errors.notes}>
    <Input bind:value={runParameters.notes}></Input>
  </FormField>
  <FormField label="threads" error={errors.threads}>
    <Input type="number" bind:value={runParameters.threads}></Input>
  </FormField>
  <Button
    class="action"
    type="submit"
    data-testid="run">{m.runPiranha()}
  </Button>
</form>
