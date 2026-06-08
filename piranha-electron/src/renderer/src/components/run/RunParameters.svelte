<script lang="ts">
  import { m } from "../../../../paraglide/messages";
  import { Button } from "$lib/shadcn/ui/button";
  import { Input } from "$lib/shadcn/ui/input";
  import { Textarea } from "$lib/shadcn/ui/textarea";
  import FormField from "../forms/FormField.svelte";
  import { runParameters, settings, appState } from "$lib/store.svelte";
  import { createPiranhaRunOptions } from "../../types";
  import { piranhaAPI } from "$lib/piranhaAPI.svelte";
  import FileSelect from "../forms/FileSelect.svelte";
  import { runParametersSchema } from "./RunFormSchema";
  import Settings from "./Settings.svelte";

  let errors = $state<Record<string, string[]>>({});

  function validate(): boolean {
    const result = runParametersSchema().safeParse({
      ...runParameters,
      ...settings,
    });
    if (!result.success) {
      errors = result.error.flatten().fieldErrors;
    } else {
      errors = {};
    }
    appState.doneInitialValidate = true;
    return result.success;
  }

  function onChange(): void {
    // validate after every change after initial failed submit, so user
    // can see when form becomes valid;
    if (appState.doneInitialSubmit) {
      validate();
    }
  }

  function onSubmit(e: SubmitEvent): void {
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
<form onsubmit={onSubmit}>
  <div
    id="scrolling-container"
    class="max-h-[calc(100vh-10rem)] overflow-y-auto px-2"
  >
    <FormField
      label={m.parameterName()}
      error={errors.name}
      labelFor="name-field"
    >
      <Input id="name-field" bind:value={runParameters.name} oninput={onChange}
      ></Input>
    </FormField>
    <FormField
      label={m.parameterBarcodesFile()}
      error={errors.barcodesFilePath}
      labelFor="barcodes-file-field"
    >
      <FileSelect
        id="barcodes-file-field"
        title={m.parameterBarcodesFile()}
        selectFolder={false}
        filters={[{ name: "csv", extensions: ["csv"] }]}
        onchange={onChange}
        bind:value={runParameters.barcodesFilePath}
      ></FileSelect>
    </FormField>
    <FormField
      label={m.parameterMinKnowFolder()}
      error={errors.minKnowFolderPath}
      labelFor="minknow-folder-field"
    >
      <FileSelect
        id="minknow-folder-field"
        title={m.parameterMinKnowFolder()}
        selectFolder={true}
        onchange={onChange}
        bind:value={runParameters.minKnowFolderPath}
      ></FileSelect>
    </FormField>
    <FormField
      label={m.parameterNotes()}
      error={errors.notes}
      labelFor="notes-field"
    >
      <Textarea
        id="notes-field"
        bind:value={runParameters.notes}
        onchange={onChange}
      ></Textarea>
    </FormField>
    <FormField
      label={m.parameterThreads()}
      error={errors.threads}
      labelFor="threads-field"
    >
      <Input
        id="threads-field"
        type="number"
        bind:value={runParameters.threads}
        oninput={onChange}
      ></Input>
    </FormField>
    <Settings {errors} onchange={onChange}></Settings>
  </div>
  <!-- Use mousedown for submit to avoid race conditions from logic which opens accordion sections in error - these
   prevent submit happening if newly fixed error has not been blurred-->
  <Button class="action float-end mt-2" onmousedown={onSubmit} data-testid="run"
    >{m.runPiranha()}
  </Button>
</form>
