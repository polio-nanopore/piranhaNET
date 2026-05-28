<script lang="ts">
  import { z } from "zod";
  import { m } from "../../../../paraglide/messages";
  import { Button } from "$lib/shadcn/ui/button";
  import UserSettings from "./UserSettings.svelte";
  import {userSettingsFormSchema} from "./RunFormSchema";
  import { runParameters, settings } from "../../lib/store.svelte";

  const {onpersist} = $props();
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

  const onSubmit = (e: SubmitEvent): void => {
    e.preventDefault();
    validateOnEachChange = true;
    const valid = validate();
    if (valid) {
      onpersist();
    }
  };

  const onChange = (): void => {
    if (validateOnEachChange) {
      validate();
    }
  };
</script>
<div class="justify-center">
  <h1 class="text-2xl mb-4" data-testid="welcome">{m.welcome()}</h1>
  <p>{m.provideInitialSettings()}</p>
  <form onsubmit={onSubmit}>
    <UserSettings {errors} onchange={onChange}></UserSettings>
    <Button class="action float-end" data-testid="continue" type="submit">{m.continue()}</Button>
  </form>
</div>
