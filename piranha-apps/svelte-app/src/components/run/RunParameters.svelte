<script lang="ts">
  import { m } from "../../paraglide/messages";
  import { Button } from "$lib/shadcn/ui/button";
  import { Input } from "$lib/shadcn/ui/input";
  import { Textarea } from "$lib/shadcn/ui/textarea";
  import FormField from "../forms/FormField.svelte";
  import {
    runParameters,
    settings,
    appState,
    webFiles,
    isWeb,
  } from "$lib/store.svelte";
  import {
    createPiranhaRunOptionsWeb,
    createPiranhaRunOptionsElectron,
  } from "../../types";
  import { piranhaAPI } from "$lib/piranhaAPI/piranhaAPI.svelte";
  import FileSelect from "../forms/FileSelect.svelte";
  import {
    runParametersSchemaElectron,
    runParametersSchemaWeb,
  } from "./RunFormSchema";
  import Settings from "./Settings.svelte";
  import { i18n } from "$lib/i18n.svelte";
  import { PiranhaWebAPI } from "$lib/piranhaAPI/piranhaWebAPI.svelte";
  import { PiranhaElectronAPI } from "$lib/piranhaAPI/piranhaElectronAPI.svelte";
  import {validateSamplesFile} from "../../lib/validation";

  let errors = $state<Record<string, string[]>>({});

  let schema = isWeb()
    ? runParametersSchemaWeb()
    : runParametersSchemaElectron();

  // Add sample file validation to the schema, which needs to be implemented difference in web/electron mode
  schema = schema.superRefine(async (data, ctx) => {
    const filePath = data.samplesFilePath;
    if (filePath) {
      let error;
      let samplesFileText;
      try {
        if (isWeb()) {
          samplesFileText = await webFiles.samplesFileList[0].text();
        } else {
          samplesFileText = await (piranhaAPI as PiranhaElectronAPI).readTextFile(filePath);
        }
      } catch (e) {
        error = m.formsErrorSamplesFileUnreadable({error: e.message});
      }

      // Validate file text
      if (!error) {
        const validateResult = validateSamplesFile(samplesFileText);
        if (!validateResult.success) {
          error = validateResult.message;
        }
      }

      if (error) {
        ctx.addIssue({
          code: "custom",
          message: error,
          path: ["samplesFilePath"]
        });
      }
    }
  });

  async function validate(): Promise<boolean> {
    const result = await schema.safeParseAsync({
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

  async function onChange(): void {
    // validate after every change after initial failed submit, so user
    // can see when form becomes valid;
    if (appState.doneInitialSubmit) {
      await validate();
    }
  }

  async function onSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const valid = await validate();
    if (valid) {
      if (isWeb()) {
        const runOptions = createPiranhaRunOptionsWeb(
          runParameters,
          settings,
          i18n.lang,
        );
        // Do not await, so we get updates as they happen
        (piranhaAPI as PiranhaWebAPI).runPiranha(
          runOptions,
          webFiles.samplesFileList[0],
          webFiles.minknowFileList,
        );
      } else {
        const runOptions = createPiranhaRunOptionsElectron(
          runParameters,
          settings,
          i18n.lang,
        );
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
      <Input
        id="name-field"
        bind:value={runParameters.runName}
        oninput={onChange}
      ></Input>
    </FormField>
    <FormField
      label={m.parameterSamplesFile()}
      help={m.helpParameterSamplesFile()}
      error={errors.samplesFilePath}
      labelFor="samples-file-field"
    >
      <FileSelect
        id="samples-file-field"
        mode={appState.mode}
        title={m.parameterSamplesFile()}
        selectFolder={false}
        filters={[{ name: "csv", extensions: ["csv"] }]}
        onchange={onChange}
        bind:value={runParameters.samplesFilePath}
        bind:fileListValue={webFiles.samplesFileList}
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
        bind:fileListValue={webFiles.minknowFileList}
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
