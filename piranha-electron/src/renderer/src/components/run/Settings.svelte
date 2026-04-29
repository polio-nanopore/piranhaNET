<script lang="ts">
  import * as Accordion from "$lib/shadcn/ui/accordion";
  import * as Select from "$lib/shadcn/ui/select";
  import { Input } from "$lib/shadcn/ui/input";
  import { m } from "../../../../paraglide/messages";
  import {settings} from "$lib/store.svelte";
  import FormField from "../forms/FormField.svelte";
  import {PiranhaProtocol} from "../../types";

  const { errors, onchange } = $props();
</script>
<script module lang="ts">
  import {requiredString} from "../utils";
  export const settingsFormSchema = {
    protocol: requiredString(),
    positiveControl: requiredString(),
    negativeControl: requiredString()
  };
</script>
<Accordion.Root class="mb-4">
  <Accordion.Item>
    <Accordion.Trigger class="accordion-trigger rounded-none">{m.settings()}</Accordion.Trigger>
    <Accordion.Content class="flex flex-col gap-4 text-balance p-2">
      <Accordion.Root type="multiple" defaultValue={["runSettings"]}>
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
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
