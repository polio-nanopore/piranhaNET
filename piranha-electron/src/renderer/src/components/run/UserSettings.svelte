<script lang="ts">
  import { m } from "../../../../paraglide/messages";
  import FormField from "../forms/FormField.svelte";
  import FileSelect from "../forms/FileSelect.svelte";
  import { Input } from "$lib/shadcn/ui/input";
  import { settings } from "$lib/store.svelte";
  import { persistentSettingsStore } from "$lib/persistentSettingsStore";

  const { errors, onchange } = $props();

  const handleChange = () => {
    persistentSettingsStore.saveUserSettings(settings);
    onchange();
  };
</script>

<FormField
  label={m.settingUserName()}
  error={errors.userName}
  labelFor="user-name-field"
>
  <Input
    id="user-name-field"
    bind:value={settings.userName}
    onchange={handleChange}
  ></Input>
</FormField>
<FormField
  label={m.settingInstitute()}
  error={errors.institute}
  labelFor="institute-field"
>
  <Input
    id="institute-field"
    bind:value={settings.institute}
    onchange={handleChange}
  ></Input>
</FormField>

<FormField
  label={m.settingOutputFolder()}
  error={errors.outputFolderPath}
  labelFor="output-folder-field"
>
  <FileSelect
    id="output-folder-field"
    title={m.settingOutputFolder()}
    selectFolder={true}
    onchange={handleChange}
    bind:value={settings.outputFolderPath}
  ></FileSelect>
</FormField>
