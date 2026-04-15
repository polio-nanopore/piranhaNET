<script lang="ts">
  import {z} from "zod";
  import { m } from "../../../../paraglide/messages";
  import {Button} from "$lib/shadcn/ui/button";
  import {Input} from "$lib/shadcn/ui/input";
  import {Textarea} from "$lib/shadcn/ui/textarea";
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
<div data-testid="new-run-title">{m.newSequencingRun()}</div>
<form onsubmit={onSubmit} >
  <FormField label={m.parameterName()} error={errors.name}>
    <Input bind:value={runParameters.name}></Input>
  </FormField>
  <FormField label={m.parameterBarcodesFile()} error={errors.barcodesFilePath}>
    <FileSelect title="barcodesFile" selectFolder={false} bind:value={runParameters.barcodesFilePath}></FileSelect>
  </FormField>
  <FormField label={m.parameterMinKnowFolder()} error={errors.minKnowFolderPath}>
    <FileSelect title="minKnowFolder" selectFolder={true} bind:value={runParameters.minKnowFolderPath}></FileSelect>
  </FormField>
  <FormField label={m.parameterOutputFolder()} error={errors.minKnowFolderPath}>
    <FileSelect title="outputFolder" selectFolder={true} bind:value={runParameters.outputFolderPath}></FileSelect>
  </FormField>
  <FormField label={m.parameterNotes()} error={errors.notes}>
    <Textarea bind:value={runParameters.notes}></Textarea>
  </FormField>
  <FormField label={m.parameterThreads()} error={errors.threads}>
    <Input type="number" bind:value={runParameters.threads}></Input>
  </FormField>
  <Button
    class="action float-end"
    type="submit"
    data-testid="run">{m.runPiranha()}
  </Button>
</form>
