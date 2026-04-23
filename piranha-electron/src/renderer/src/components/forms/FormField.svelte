<!-- $lib/components/FormField.svelte -->
<script lang="ts">
  import { Label } from "$lib/shadcn/ui/label";
  import type { Snippet } from "svelte";

  let {
    label,
    labelFor,
    error,
    children
  }: {
    label: string;
    for: string;
    error?: string[];
    children: Snippet
  } = $props();
</script>

<div class="space-y-2 py-3">
  <Label class={["font-light", error && "text-destructive"]} for={labelFor}>{label}</Label>

  {@render children()}

  {#if error}
    <p class="text-sm font-medium text-destructive">{error[0]}</p>
  {/if}
</div>
