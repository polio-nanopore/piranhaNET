<script module lang="ts">
  import {requiredString} from "../utils";
  import * as Accordion from "$lib/shadcn/ui/accordion";
  import { m } from "../../../../paraglide/messages";
  import {settings} from "$lib/store.svelte";
  import FormField from "../forms/FormField.svelte";

  export const settingsFormSchema = {
    protocol: requiredString(),
    positiveControl: requiredString(),
    negativeControl: requiredString()
  };

  const { errors, onchange } = $props();
</script>

<Accordion.Root>
  <Accordion.Item>
    <Accordion.Trigger>{m.settings()}</Accordion.Trigger>
    <Accordion.Content class="flex flex-col gap-4 text-balance">
      <FormField
        label={m.settingPositiveControl()}
        error={errors.positiveControl}
        labelFor="positive-control-field"
      >
        <Input id="name-field" bind:value={settings.positiveControl} onchange={onChange}
        ></Input>
      </FormField>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
