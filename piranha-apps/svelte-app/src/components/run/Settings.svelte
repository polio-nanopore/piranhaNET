<script lang="ts">
  import * as Accordion from "$lib/shadcn/ui/accordion";
  import * as Select from "$lib/shadcn/ui/select";
  import { Input } from "$lib/shadcn/ui/input";
  import { Switch } from "$lib/shadcn/ui/switch";
  import { m } from "../../paraglide/messages";
  import { settings } from "$lib/store.svelte";
  import FormField from "../forms/FormField.svelte";
  import { PiranhaProtocol, PiranhaOrientation } from "../../types";
  import { persistentSettingsStore } from "../../lib/persistentSettingsStore";
  import {
    runSettingsFormSchema,
    piranhaOutputSettingsFormSchema,
    userSettingsFormSchema,
  } from "./RunFormSchema";
  import UserSettings from "./UserSettings.svelte";

  const RUN_SETTINGS_SECTION = "runSettings";
  const PIRANHA_OUTPUT_SETTINGS_SECTION = "piranhaOutputSettings";
  const USER_SETTINGS_SECTION = "userSettings";

  const { errors, onchange } = $props();
  // check if run settings are uninitialised on load - open RunSettings section by default if so
  const runSettingsUninitialised = !persistentSettingsStore.loadRunSettings();

  let openSections = $state(
    runSettingsUninitialised ? [RUN_SETTINGS_SECTION] : [],
  );

  const sectionNameIfErrors = (sectionSchema, sectionName): string | null =>
    Object.keys(sectionSchema).some((key) => Object.keys(errors).includes(key))
      ? sectionName
      : null;

  const sectionsWithError: string[] = $derived(
    [
      sectionNameIfErrors(runSettingsFormSchema(), RUN_SETTINGS_SECTION),
      sectionNameIfErrors(
        piranhaOutputSettingsFormSchema(),
        PIRANHA_OUTPUT_SETTINGS_SECTION,
      ),
      sectionNameIfErrors(userSettingsFormSchema(), USER_SETTINGS_SECTION),
    ].filter((s) => !!s),
  );

  // on sectionsWithError change - add any sections with error to openSections which are not currently open
  $effect(() => {
    sectionsWithError
      .filter((s) => !openSections.includes(s))
      .forEach((s) => openSections.push(s));
  });

  const handleRunSettingsChange = (): void => {
    persistentSettingsStore.saveRunSettings(settings);
    onchange();
  };
</script>

<Accordion.Root
  data-testid="settings"
  class="mb-4"
  type="single"
  value={openSections.length ? "settings" : ""}
>
  <Accordion.Item value="settings">
    <Accordion.Trigger class="accordion-trigger rounded-none px-2"
      >{m.settings()}</Accordion.Trigger
    >
    <Accordion.Content class="flex flex-col gap-4 text-balance p-2">
      <Accordion.Root type="multiple" bind:value={openSections}>
        <Accordion.Item
          data-testid={RUN_SETTINGS_SECTION}
          value={RUN_SETTINGS_SECTION}
        >
          <Accordion.Trigger
            class="bg-muted accordion-trigger rounded-none px-2"
            >{m.runSettings()}</Accordion.Trigger
          >
          <Accordion.Content
            class="flex flex-col gap-4 text-balance border-muted-foreground px-2"
          >
            <FormField
              label={m.settingProtocol()}
              help={m.helpSettingProtocol()}
              error={errors.protocol}
              labelFor="protocol-field"
            >
              <Select.Root
                type="single"
                bind:value={settings.protocol}
                onValueChange={handleRunSettingsChange}
              >
                <Select.Trigger class="w-full" id="protocol-field"
                  >{settings.protocol}</Select.Trigger
                >
                <Select.Content>
                  {#each Object.values(PiranhaProtocol) as protocol (protocol)}
                    <Select.Item value={protocol} label={protocol}
                      >{protocol}</Select.Item
                    >
                  {/each}
                </Select.Content>
              </Select.Root>
            </FormField>
            <FormField
              label={m.settingPositiveControl()}
              help={m.helpSettingPositiveControl()}
              error={errors.positiveControl}
              labelFor="positive-control-field"
            >
              <Input
                id="positive-control-field"
                bind:value={settings.positiveControl}
                oninput={handleRunSettingsChange}
              ></Input>
            </FormField>
            <FormField
              label={m.settingNegativeControl()}
              help={m.helpSettingNegativeControl()}
              error={errors.negativeControl}
              labelFor="negative-control-field"
            >
              <Input
                id="negative-control-field"
                bind:value={settings.negativeControl}
                oninput={handleRunSettingsChange}
              ></Input>
            </FormField>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item
          data-testid={PIRANHA_OUTPUT_SETTINGS_SECTION}
          value={PIRANHA_OUTPUT_SETTINGS_SECTION}
        >
          <Accordion.Trigger
            class="bg-muted accordion-trigger rounded-none px-2"
            >{m.piranhaOutputSettings()}</Accordion.Trigger
          >
          <Accordion.Content
            class="flex flex-col gap-4 text-balance border-muted-foreground px-2"
          >
            <FormField
              label={m.settingOrientation()}
              help={m.helpSettingOrientation()}
              error={errors.orientation}
              labelFor="orientation-field"
            >
              <Select.Root
                type="single"
                bind:value={settings.orientation}
                onValueChange={onchange}
              >
                <Select.Trigger class="w-full" id="orientation-field"
                  >{settings.orientation}</Select.Trigger
                >
                <Select.Content>
                  {#each Object.values(PiranhaOrientation) as orientation (orientation)}
                    <Select.Item value={orientation} label={orientation}
                      >{orientation}</Select.Item
                    >
                  {/each}
                </Select.Content>
              </Select.Root>
            </FormField>
            <FormField
              label={m.settingOutputPrefix()}
              help={m.helpSettingOutputPrefix()}
              error={errors.outputPrefix}
              labelFor="output-prefix-field"
            >
              <Input
                id="output-prefix-field"
                bind:value={settings.outputPrefix}
                oninput={onchange}
              ></Input>
            </FormField>
            <div class="flex space-x-10">
              <FormField
                label={m.settingOverwriteOutput()}
                help={m.helpSettingOverwriteOutput()}
                error={errors.overwriteOutput}
                labelFor="overwrite-output-field"
              >
                <Switch
                  id="overwrite-output-field"
                  bind:checked={settings.overwriteOutput}
                  onCheckedChange={onchange}
                ></Switch>
              </FormField>
              <FormField
                label={m.settingOutputIntermediateFiles()}
                help={m.settingOutputIntermediateFiles()}
                error={errors.outputIntermediateFiles}
                labelFor="output-intermediate-files-field"
              >
                <Switch
                  id="output-intermediate-files-field"
                  bind:checked={settings.outputIntermediateFiles}
                  onCheckedChange={onchange}
                ></Switch>
              </FormField>
              <FormField
                label={m.settingAllMetadataToHeader()}
                help={m.helpSettingAllMetadataToHeader()}
                error={errors.allMetadataToHeader}
                labelFor="all-metadata-to-header-field"
              >
                <Switch
                  id="all-metadata-to-header-field"
                  bind:checked={settings.allMetadataToHeader}
                  onCheckedChange={onchange}
                ></Switch>
              </FormField>
              <FormField
                label={m.settingDateStamp()}
                help={m.helpSettingDateStamp()}
                error={errors.dateStamp}
                labelFor="date-stamp-field"
              >
                <Switch
                  id="date-stamp-field"
                  bind:checked={settings.dateStamp}
                  onCheckedChange={onchange}
                ></Switch>
              </FormField>
            </div>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item
          data-testid={USER_SETTINGS_SECTION}
          value={USER_SETTINGS_SECTION}
        >
          <Accordion.Trigger
            class="bg-muted accordion-trigger rounded-none px-2"
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
