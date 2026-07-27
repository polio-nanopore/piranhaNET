<script>
  import * as Tooltip from "$lib/shadcn/ui/tooltip";
  import Run from "../../../../src/components/run/Run.svelte";
  import RunParameters from "../../../../src/components/run/RunParameters.svelte";
  import Settings from "../../../../src/components/run/Settings.svelte";
  import UserSettings from "../../../../src/components/run/UserSettings.svelte";
  import Welcome from "../../../../src/components/run/Welcome.svelte";

  let { componentName, ...componentProps } = $props();
</script>

<Tooltip.Provider>
  {#if componentName === "Run"}
    <Run></Run>
  {/if}
  {#if componentName === "RunParameters"}
    <RunParameters></RunParameters>
  {/if}
  {#if componentName === "Settings"}
    <Settings errors={componentProps.errors} onchange={componentProps.onchange}
    ></Settings>
  {/if}
  {#if componentName === "UserSettings"}
    <UserSettings
      errors={componentProps.errors}
      onchange={componentProps.onchange}
    ></UserSettings>
  {/if}
  {#if componentName === "Welcome"}
    <Welcome onpersist={componentProps.onpersist}></Welcome>
  {/if}
</Tooltip.Provider>
