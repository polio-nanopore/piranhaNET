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
    notes: z.string().nonempty(),
    threads: z.number().min(1).max(20)
  });

  let errors = $state<Record<string, string[]>>({});

  let doneInitialSubmit = $state(false);

  function validate(): boolean {
    const result = formSchema.safeParse(runParameters);
    if (!result.success) {
      errors = result.error.flatten().fieldErrors;
    } else {
      errors = {};
    }
    return result.success;
  }

  function onChange() {
    // validate after every change after initial failed submit, so user
    // can see when form becomes valid;
    if (doneInitialSubmit) {
      validate()
    }
  }

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    const valid = validate();
    if (valid) {
      const runOptions = createPiranhaRunOptions(runParameters, settings);
      piranhaAPI.runPiranha(runOptions);
    }
    doneInitialSubmit = true;
  }

</script>
<div data-testid="new-run-title">{m.newSequencingRun()}</div>
<form onsubmit={onSubmit} >
  <FormField label={m.parameterName()} error={errors.name}>
    <Input bind:value={runParameters.name} onchange={onChange}></Input>
  </FormField>
  <FormField label={m.parameterBarcodesFile()} error={errors.barcodesFilePath}>
    <FileSelect title={m.parameterBarcodesFile()}
                selectFolder={false}
                filters={[{name: "csv", extensions: ["csv"]}]}
                onchange={onChange}
                bind:value={runParameters.barcodesFilePath}></FileSelect>
  </FormField>
  <FormField label={m.parameterMinKnowFolder()} error={errors.minKnowFolderPath}>
    <FileSelect title={m.parameterMinKnowFolder()}
                selectFolder={true}
                onchange={onChange}
                bind:value={runParameters.minKnowFolderPath}></FileSelect>
  </FormField>
  <FormField label={m.parameterOutputFolder()} error={errors.outputFolderPath}>
    <FileSelect title={m.parameterOutputFolder()}
                selectFolder={true}
                onchange={onChange}
                bind:value={runParameters.outputFolderPath}></FileSelect>
  </FormField>
  <FormField label={m.parameterNotes()} error={errors.notes}>
    <Textarea bind:value={runParameters.notes} onchange={onChange}></Textarea>
  </FormField>
  <FormField label={m.parameterThreads()} error={errors.threads}>
    <Input type="number" bind:value={runParameters.threads} onchange={onChange}></Input>
  </FormField>
  <Button
    class="action float-end"
    type="submit"
    data-testid="run">{m.runPiranha()}
  </Button>
</form>
