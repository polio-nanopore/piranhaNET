<!-- $lib/components/FormField.svelte -->
<script lang="ts">
  import { Label } from "$lib/shadcn/ui/label";
  import * as Tooltip from "$lib/shadcn/ui/tooltip";
  import { CircleQuestionMark } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  let {
    label,
    help,
    labelFor,
    error,
    children,
    class: className,
  }: {
    label: string;
    help: string;
    for: string;
    error?: string[];
    children: Snippet;
    className: string;
  } = $props();
</script>

<div class={`space-y-2 py-3 ${className ?? ""}`}>
  {#if help}
    <Tooltip.Root>
      <Tooltip.Trigger class="float-right pl-2">
        <CircleQuestionMark size="16"></CircleQuestionMark>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>{help}</p>
      </Tooltip.Content>
    </Tooltip.Root>
  {/if}
  <Label
    data-testid={`${labelFor}-label`}
    class={["font-light", error && "text-destructive"]}
    for={labelFor}>{label}</Label
  >
  {@render children()}
  {#if error}
    <p
      data-testid={`${labelFor}-error`}
      class="text-sm font-medium text-destructive"
    >
      {error[0]}
    </p>
  {/if}
</div>
