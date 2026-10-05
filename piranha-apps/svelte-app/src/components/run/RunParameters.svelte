<script lang="ts">
  import { m } from "../../paraglide/messages";
  import { Button } from "$lib/shadcn/ui/button";
  import { Input } from "$lib/shadcn/ui/input";
  import { Textarea } from "$lib/shadcn/ui/textarea";
  import FormField from "../forms/FormField.svelte";
  import { runParameters, settings, appState, isWeb } from "$lib/store.svelte";
  import { createPiranhaRunOptionsWeb, createPiranhaRunOptionsElectron } from "../../types";
  import { piranhaAPI } from "$lib/piranhaAPI/piranhaAPI.svelte";
  import FileSelect from "../forms/FileSelect.svelte";
  import { runParametersSchemaElectron, runParametersSchemaWeb } from "./RunFormSchema";
  import Settings from "./Settings.svelte";
  import { i18n } from "$lib/i18n.svelte";
  import {PiranhaWebAPI} from "../../lib/piranhaAPI/piranhaWebAPI.svelte";

  let errors = $state<Record<string, string[]>>({});

  let barcodesFileValue = $state();
  let minknowFolderValue = $state();

  const schema = isWeb() ? runParametersSchemaWeb() : runParametersSchemaElectron();

  function validate(): boolean {
    const result = schema.safeParse({
      ...runParameters,
      ...settings,
    });
    if (!result.success) {
      errors = result.error.flatten().fieldErrors;
    } else {
      errors = {};
    }
    appState.doneInitialValidate = true;
    console.log("errors")
    console.log(JSON.stringify(errors))
    return result.success;
  }

  function onChange(): void {
    // validate after every change after initial failed submit, so user
    // can see when form becomes valid;
    if (appState.doneInitialSubmit) {
      validate();
    }
  }

  async function onSubmit(e: SubmitEvent): Promise<void> {
    console.log("validating")
    e.preventDefault();
    const valid = validate();
    if (valid) {
      console.log("valid")
      if (isWeb()) {
        console.log("running")
        const runOptions = createPiranhaRunOptionsWeb(runParameters, settings, i18n.lang);
        await (piranhaAPI as PiranhaWebAPI).runPiranha(runOptions, barcodesFileValue.item(0), minknowFolderValue);
      } else {
        const runOptions = createPiranhaRunOptionsElectron(runParameters, settings, i18n.lang);
        await (piranhaAPI as PiranhaElectronAPI).runPiranha(runOptions);
      }
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
      help={m.helpParameterName()}
      error={errors.runName}
      labelFor="name-field"
    >
      <Input id="name-field" bind:value={runParameters.runName} oninput={onChange}
      ></Input>
    </FormField>
    <FormField
      label={m.parameterBarcodesFile()}
      help={m.helpParameterBarcodesFile()}
      error={errors.barcodesFilePath}
      labelFor="barcodes-file-field"
    >
      <FileSelect
        id="barcodes-file-field"
        mode={appState.mode}
        title={m.parameterBarcodesFile()}
        selectFolder={false}
        filters={[{ name: "csv", extensions: ["csv"] }]}
        onchange={onChange}
        bind:value={runParameters.barcodesFilePath}
        bind:fileListValue={barcodesFileValue}
      ></FileSelect>
    </FormField>
    <FormField
      label={m.parameterMinKnowFolder()}
      help={m.helpParameterMinKnowFolder()}
      error={errors.minKnowFolderPath}
      labelFor="minknow-folder-field"
    >
      <FileSelect
        id="minknow-folder-field"
        mode={appState.mode}
        title={m.parameterMinKnowFolder()}
        selectFolder={true}
        onchange={onChange}
        bind:value={runParameters.minKnowFolderPath}
        bind:fileListValue={minknowFolderValue}
      ></FileSelect>
    </FormField>
    <FormField
      label={m.parameterNotes()}
      help={m.helpParameterNotes()}
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
      help={m.helpParameterThreads()}
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
