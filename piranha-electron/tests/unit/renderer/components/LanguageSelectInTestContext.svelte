<script>
  import * as NavigationMenu from "$lib/shadcn/ui/navigation-menu";
  import LanguageSelect from "../../../../src/renderer/src/components/nav/LanguageSelect.svelte";
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <LanguageSelect></LanguageSelect>
  </NavigationMenu.List>
</NavigationMenu.Root>
