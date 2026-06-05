<script>
  import * as NavigationMenu from "$lib/shadcn/ui/navigation-menu";
  import LanguageSelect from "../../../../src/components/nav/LanguageSelect.svelte";
  import NavLink from "../../../../src/components/nav/NavLink.svelte";

  let { componentName, ...componentProps } = $props();
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    {#if componentName === "LanguageSelect"}
      <LanguageSelect></LanguageSelect>
    {/if}
    {#if componentName === "NavLink"}
      <NavLink
        router={componentProps.router}
        route={componentProps.route}
        textKey={componentProps.textKey}
      ></NavLink>
    {/if}
  </NavigationMenu.List>
</NavigationMenu.Root>
