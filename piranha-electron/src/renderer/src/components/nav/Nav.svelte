<script lang="ts">
  import {useTinyRouter} from "svelte-tiny-router";
  import piranhaLogo from "../../assets/piranha.svg";
  import * as NavigationMenu from "$lib/shadcn/ui/navigation-menu";
  import NavLink from "./NavLink.svelte";
  import LanguageSelect from "./LanguageSelect.svelte";

  const router = useTinyRouter();

  // We may be on first load or reloading due to language change - retain the route in latter case, otherwise navigate
  // to default /run route
  const route = router.path === "/" ? "/run" : router.path;
  router.navigate(route);
</script>

<NavigationMenu.Root class="nav bg-primary text-primary-foreground max-w-full justify-between text-2xl">
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <img alt="logo" class="logo ml-2 mr-4" src={piranhaLogo} />
    </NavigationMenu.Item>
    <NavigationMenu.Item>
      <div class="font-bold pn-title">PiranhaNET</div>
    </NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.List>
    <NavLink route="/run" textKey="run" router={router} />
  </NavigationMenu.List>
  <NavigationMenu.List>
    <NavLink route="/about" textKey="about" router={router} />
    <LanguageSelect/>
  </NavigationMenu.List>
</NavigationMenu.Root>


