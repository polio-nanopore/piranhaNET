<script lang="ts">
  import * as Accordion from "$lib/shadcn/ui/accordion";
  import * as Select from "$lib/shadcn/ui/select";
  import { Input } from "$lib/shadcn/ui/input";
  import { Switch } from "$lib/shadcn/ui/switch";
  import { m } from "../../../../paraglide/messages";
  import { settings, appState } from "$lib/store.svelte";
  import FormField from "../forms/FormField.svelte";
  import { PiranhaProtocol, PiranhaOrientation } from "../../types";
  import {persistentSettingStore} from "../../lib/persistentSettingsStore";
  import {runSettingsFormSchema, piranhaOutputSettingsFormSchema, userSettingsFormSchema} from "./RunFormSchema";
  import UserSettings from "./UserSettings.svelte";

  const RUN_SETTINGS_SECTION = "runSettings";
  const PIRANHA_OUTPUT_SETTINGS_SECTION = "piranhaOutputSettings";
  const USER_SETTINGS_SECTION = "userSettings";

  const { errors, onchange } = $props();
  // check if run settings are uninitialised on load - open RunSettings section by default if so
  const runSettingsUninitialised = !persistentSettingStore.loadRunSettings();

  let openSections = $state(runSettingsUninitialised ? [RUN_SETTINGS_SECTION] : []);

  const sectionNameIfErrors = (sectionSchema, sectionName) =>
    Object.keys(sectionSchema).some((key) => Object.keys(errors).includes(key)) ? sectionName : null;
  const sectionsWithError = $derived([
    sectionNameIfErrors(runSettingsFormSchema(), RUN_SETTINGS_SECTION),
    sectionNameIfErrors(piranhaOutputSettingsFormSchema(), PIRANHA_OUTPUT_SETTINGS_SECTION),
    sectionNameIfErrors(userSettingsFormSchema(), USER_SETTINGS_SECTION),
  ].filter((s) => !!s));

  // on sectionsWithError change - add any sections with error to openSections which are not currently open
  $effect(() => {
    sectionsWithError.filter((s) => !openSections.includes(s)).forEach((s) => openSections.push(s));
  });

  const handleRunSettingsChange = () => {
    persistentSettingStore.saveRunSettings(settings);
    onchange();
  };
</script>
<Accordion.Root class="mb-4" type="single" value={(openSections.length ? "settings" : "")}>
  <Accordion.Item value="settings">
    <Accordion.Trigger class="accordion-trigger rounded-none px-2"
      >{m.settings()}</Accordion.Trigger
    >
    <Accordion.Content class="flex flex-col gap-4 text-balance p-2">
      <Accordion.Root type="multiple" bind:value={openSections}>
        <Accordion.Item value={RUN_SETTINGS_SECTION}>
          <Accordion.Trigger class="bg-muted accordion-trigger rounded-none px-2"
            >{m.runSettings()}</Accordion.Trigger
          >
          <Accordion.Content
            class="flex flex-col gap-4 text-balance border-muted-foreground px-2"
          >
            <FormField
              label={m.settingProtocol()}
              error={errors.protocol}
              labelFor="protocol-field"
            >
              <Select.Root
                type="single"
                id="protocol-field"
                bind:value={settings.protocol}
                onchange={handleRunSettingsChange}
              >
                <Select.Trigger class="w-full"
                  >{settings.protocol}</Select.Trigger
                >
                <Select.Content>
                  <!-- TODO: check if protocol should be translated - it isn't in old GUI -->
                  {#each Object.values(PiranhaProtocol) as protocol}
                    <Select.Item value={protocol} label={protocol}
                      >{protocol}</Select.Item
                    >
                  {/each}
                </Select.Content>
              </Select.Root>
            </FormField>
            <FormField
              label={m.settingPositiveControl()}
              error={errors.positiveControl}
              labelFor="positive-control-field"
            >
              <Input
                id="positive-control-field"
                bind:value={settings.positiveControl}
                onchange={handleRunSettingsChange}
              ></Input>
            </FormField>
            <FormField
              label={m.settingNegativeControl()}
              error={errors.negativeControl}
              labelFor="negative-control-field"
            >
              <Input
                id="negative-control-field"
                bind:value={settings.negativeControl}
                onchange={handleRunSettingsChange}
              ></Input>
            </FormField>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value={PIRANHA_OUTPUT_SETTINGS_SECTION}>
          <Accordion.Trigger class="bg-muted accordion-trigger rounded-none px-2"
            >{m.piranhaOutputSettings()}</Accordion.Trigger
          >
          <Accordion.Content
            class="flex flex-col gap-4 text-balance border-muted-foreground px-2"
          >
            <FormField
              label={m.settingOrientation()}
              error={errors.orientation}
              labelFor="orientation-field"
            >
              <Select.Root
                type="single"
                id="protocol-field"
                bind:value={settings.orientation}
                {onchange}
              >
                <Select.Trigger class="w-full"
                  >{settings.orientation}</Select.Trigger
                >
                <Select.Content>
                  <!-- TODO: check if orientation should be translated - it isn't in old GUI -->
                  {#each Object.values(PiranhaOrientation) as orientation}
                    <Select.Item value={orientation} label={orientation}
                      >{orientation}</Select.Item
                    >
                  {/each}
                </Select.Content>
              </Select.Root>
            </FormField>
            <FormField
              label={m.settingOutputPrefix()}
              error={errors.outputPrefix}
              labelFor="output-prefix-field"
            >
              <Input
                id="output-prefix-field"
                bind:value={settings.outputPrefix}
                {onchange}
              ></Input>
            </FormField>
            <div class="flex space-x-10">
            <FormField
              label={m.settingOverwriteOutput()}
              error={errors.overwriteOutput}
              labelFor="overwrite-output-field"
            >
              <Switch
                id="overwrite-output-field"
                bind:checked={settings.overwriteOutput}
                {onchange}
              ></Switch>
            </FormField>
            <FormField
              label={m.settingOutputIntermediateFiles()}
              error={errors.outputIntermediateFiles}
              labelFor="output-intermediate-files-field"
            >
              <Switch
                id="output-intermediate-files-field"
                bind:checked={settings.outputIntermediateFiles}
                {onchange}
              ></Switch>
            </FormField>
            <FormField
              label={m.settingAllMetadataToHeader()}
              error={errors.allMetadataToHeader}
              labelFor="all-metadata-to-header-field"
            >
              <Switch
                id="all-metadata-to-header-field"
                bind:checked={settings.allMetadataToHeader}
                {onchange}
              ></Switch>
            </FormField>
            <FormField
              label={m.settingDateStamp()}
              error={errors.dateStamp}
              labelFor="date-stamp-field"
            >
              <Switch
                id="date-stamp-field"
                bind:checked={settings.dateStamp}
                {onchange}
              ></Switch>
            </FormField>
            </div>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value={USER_SETTINGS_SECTION}>
          <Accordion.Trigger class="bg-muted accordion-trigger rounded-none px-2"
          >{m.userSettings()}</Accordion.Trigger
          >
          <Accordion.Content
            class="flex flex-col gap-4 text-balance border-muted-foreground px-2"
          >
            <UserSettings {errors} {onchange}></UserSettings>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
