<script lang="ts">
  import {z} from "zod";
  import { m } from "../../../../paraglide/messages";
  import {Button} from "$lib/shadcn/ui/button";
  import {Input} from "$lib/shadcn/ui/input";
  import {Textarea} from "$lib/shadcn/ui/textarea";
  import FormField from "../forms/FormField.svelte";
  import {runParameters, settings, appState} from "../../lib/store.svelte";
  import {createPiranhaRunOptions} from "../../types";
  import {piranhaAPI} from "../../lib/piranhaAPI.svelte";
  import FileSelect from "../forms/FileSelect.svelte";

  const THREADS_MIN = 1;
  const THREADS_MAX = 20;

  const requiredString = () => z.string().nonempty(m.formsErrorRequiredValue());
  const threadsRangeError = m.formsErrorRange({min: THREADS_MIN, max: THREADS_MAX});

  const formSchema = z.object({
    name: requiredString(),
    barcodesFilePath: requiredString(),
    minKnowFolderPath:requiredString(),
    outputFolderPath: requiredString(),
    notes: requiredString(),
    threads: z.number(m.formsErrorNumberRequired())
              .min(THREADS_MIN, {error: threadsRangeError})
              .max(THREADS_MAX, {error: threadsRangeError})
  });

  let errors = $state<Record<string, string[]>>({});

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
    if (appState.doneInitialSubmit) {
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
    appState.doneInitialSubmit = true;
  }

  // We may be reloading after a language change - validate in new language if initial submit has been done
  if (appState.doneInitialSubmit) {
    validate();
  }

</script>
<div data-testid="new-run-title">{m.newSequencingRun()}</div>
<form onsubmit={onSubmit} >
  <FormField label={m.parameterName()} error={errors.name} labelFor="name-field">
    <Input id="name-field" bind:value={runParameters.name} onchange={onChange}></Input>
  </FormField>
  <FormField label={m.parameterBarcodesFile()} error={errors.barcodesFilePath} labelFor="barcodes-file-field">
    <FileSelect id="barcodes-file-field"
                title={m.parameterBarcodesFile()}
                selectFolder={false}
                filters={[{name: "csv", extensions: ["csv"]}]}
                onchange={onChange}
                bind:value={runParameters.barcodesFilePath}></FileSelect>
  </FormField>
  <FormField label={m.parameterMinKnowFolder()} error={errors.minKnowFolderPath} labelFor="minknow-folder-field">
    <FileSelect id="minknow-folder-field"
                title={m.parameterMinKnowFolder()}
                selectFolder={true}
                onchange={onChange}
                bind:value={runParameters.minKnowFolderPath}></FileSelect>
  </FormField>
  <FormField label={m.parameterOutputFolder()} error={errors.outputFolderPath} labelFor="output-folder-field" >
    <FileSelect id="output-folder-field"
                title={m.parameterOutputFolder()}
                selectFolder={true}
                onchange={onChange}
                bind:value={runParameters.outputFolderPath}></FileSelect>
  </FormField>
  <FormField label={m.parameterNotes()} error={errors.notes} labelFor="notes-field">
    <Textarea id="notes-field" bind:value={runParameters.notes} onchange={onChange}></Textarea>
  </FormField>
  <FormField label={m.parameterThreads()} error={errors.threads} labelFor="threads-field">
    <Input id="threads-field" type="number" bind:value={runParameters.threads} onchange={onChange}></Input>
  </FormField>
  <Button
    class="action float-end"
    type="submit"
    data-testid="run">{m.runPiranha()}
  </Button>
</form>
