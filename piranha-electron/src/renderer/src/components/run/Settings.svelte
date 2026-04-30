<script lang="ts">
  import * as Accordion from "$lib/shadcn/ui/accordion";
  import * as Select from "$lib/shadcn/ui/select";
  import { Input } from "$lib/shadcn/ui/input";
  import { Switch } from "$lib/shadcn/ui/switch";
  import { m } from "../../../../paraglide/messages";
  import {settings} from "$lib/store.svelte";
  import FormField from "../forms/FormField.svelte";
  import {PiranhaProtocol, PiranhaOrientation} from "../../types";

  const { errors, onchange } = $props();
</script>
<script module lang="ts">
  import {requiredString} from "../utils";
  import * as z from "zod";
  import PersistentSettings, {persistentSettingsFormSchema} from "./PersistentSettings.svelte";

  export const settingsFormSchema = {
    protocol: requiredString(),
    positiveControl: requiredString(),
    negativeControl: requiredString(),
    orientation: requiredString(),
    outputPrefix: z.string(),
    overwriteOutput: z.boolean(),
    outputIntermediateFiles: z.boolean(),
    allMetadataToHeader: z.boolean(),
    dateStamp: z.boolean(),
    ...persistentSettingsFormSchema
  };
</script>
<Accordion.Root class="mb-4">
  <Accordion.Item>
    <Accordion.Trigger class="accordion-trigger rounded-none">{m.settings()}</Accordion.Trigger>
    <Accordion.Content class="flex flex-col gap-4 text-balance p-2">
      <Accordion.Root type="multiple" defaultValue={["runSettings"]}>
        <Accordion.Item value="persistentSettings">
          <Accordion.Trigger class="bg-muted accordion-trigger rounded-none">{m.persistentSettings()}</Accordion.Trigger>
          <Accordion.Content class="flex flex-col gap-4 text-balance border-muted-foreground">
            <PersistentSettings errors={errors} onchange={onchange} ></PersistentSettings>
          </Accordion.Content>
        </Accordion.Item>
        <!-- TODO: why doesn't this open by default?? -->
        <Accordion.Item value="runSettings">
          <Accordion.Trigger class="bg-muted accordion-trigger rounded-none">{m.runSettings()}</Accordion.Trigger>
          <Accordion.Content class="flex flex-col gap-4 text-balance border-muted-foreground">
            <FormField
              label={m.settingProtocol()}
              error={errors.protocol}
              labelFor="protocol-field"
            >
              <Select.Root type="single" id="protocol-field" bind:value={settings.protocol} onchange={onchange}
              >
                <Select.Trigger class="w-full">{settings.protocol}</Select.Trigger>
                <Select.Content>
                  <!-- TODO: check if protocol should be translated - it isn't in old GUI -->
                  {#each Object.values(PiranhaProtocol) as protocol}
                    <Select.Item value={protocol} label={protocol}>{protocol}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            </FormField>
            <FormField
            label={m.settingPositiveControl()}
            error={errors.positiveControl}
            labelFor="positive-control-field"
            >
              <Input id="positive-control-field" bind:value={settings.positiveControl} onchange={onchange}
              ></Input>
            </FormField>
            <FormField
              label={m.settingNegativeControl()}
              error={errors.negativeControl}
              labelFor="negative-control-field"
            >
              <Input id="negative-control-field" bind:value={settings.negativeControl} onchange={onchange}
              ></Input>
            </FormField>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
      <Accordion.Item value="piranhaOutputSettings">
        <Accordion.Trigger class="bg-muted accordion-trigger rounded-none">{m.piranhaOutputSettings()}</Accordion.Trigger>
        <Accordion.Content class="flex flex-col gap-4 text-balance border-muted-foreground">
          <FormField
            label={m.settingOrientation()}
            error={errors.orientation}
            labelFor="orientation-field"
          >
            <Select.Root type="single" id="protocol-field" bind:value={settings.orientation} onchange={onchange}
            >
              <Select.Trigger class="w-full">{settings.orientation}</Select.Trigger>
              <Select.Content>
                <!-- TODO: check if orientation should be translated - it isn't in old GUI -->
                {#each Object.values(PiranhaOrientation) as orientation}
                  <Select.Item value={orientation} label={orientation}>{orientation}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </FormField>
          <FormField
            label={m.settingOutputPrefix()}
            error={errors.outputPrefix}
            labelFor="output-prefix-field"
          >
            <Input id="output-prefix-field" bind:value={settings.outputPrefix} onchange={onchange}
            ></Input>
          </FormField>
          <FormField
            label={m.settingOverwriteOutput()}
            error={errors.overwriteOutput}
            labelFor="overwrite-output-field"
          >
            <Switch id="overwrite-output-field" bind:checked={settings.overwriteOutput} onchange={onchange}
            ></Switch>
          </FormField>
          <FormField
            label={m.settingOutputIntermediateFiles()}
            error={errors.outputIntermediateFiles}
            labelFor="output-intermediate-files-field"
          >
            <Switch id="output-intermediate-files-field" bind:checked={settings.outputIntermediateFiles} onchange={onchange}
            ></Switch>
          </FormField>
          <FormField
            label={m.settingAllMetadataToHeader()}
            error={errors.allMetadataToHeader}
            labelFor="all-metadata-to-header-field"
          >
            <Switch id="all-metadata-to-header-field" bind:checked={settings.allMetadataToHeader} onchange={onchange}
            ></Switch>
          </FormField>
          <FormField
            label={m.settingDateStamp()}
            error={errors.dateStamp}
            labelFor="date-stamp-field"
          >
            <Switch id="date-stamp-field" bind:checked={settings.dateStamp} onchange={onchange}
            ></Switch>
          </FormField>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
