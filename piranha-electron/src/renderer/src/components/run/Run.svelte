<script lang="ts">
  import { z, type ZodString } from "zod";
  import { m } from "../../../../paraglide/messages";
  import { Button } from "$lib/shadcn/ui/button";
  import { piranhaAPI } from "$lib//piranhaAPI.svelte";
  import RunParameters from "./RunParameters.svelte";
  import RunProgress from "./RunProgress.svelte";
  import { persistentSettingStore } from "$lib/persistentSettingsStore";
  import UserSettings from "./UserSettings.svelte";
  import {userSettingsFormSchema} from "./RunFormSchema";
  import { appState, runParameters, settings } from "../../lib/store.svelte";

  let needsFirstPersist = $state(!persistentSettingStore.loadUserSettings());
  let errors = $state<Record<string, string[]>>({});
  let validateOnEachChange = false;

  const formSchema = z.object(userSettingsFormSchema());

  function validate(): boolean {
    const result = formSchema.safeParse({ ...runParameters, ...settings });
    if (!result.success) {
      errors = result.error.flatten().fieldErrors;
    } else {
      errors = {};
    }
    return result.success;
  }

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    validateOnEachChange = true;
    const valid = validate();
    if (valid) {
      needsFirstPersist = false;
    }
  };

  const onChange = () => {
    if (validateOnEachChange) {
      validate();
    }
  };
</script>

<div class="container mx-auto p-4">
  {#if needsFirstPersist}
    <!-- TODO: put this form in its own component -->
    <div class="justify-center">
      <h1 class="text-2xl mb-4">{m.welcome()}</h1>
      <p>{m.provideInitialSettings()}</p>
      <form onsubmit={onSubmit}>
        <UserSettings {errors} onchange={onChange}></UserSettings>
        <Button class="action float-end" type="submit">{m.continue()}</Button>
      </form>
    </div>
  {:else if !piranhaAPI.running && !piranhaAPI.log.length}
    <RunParameters />
  {:else}
    <RunProgress />
  {/if}
</div>
