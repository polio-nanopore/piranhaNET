<script lang="ts">
  import {useTinyRouter} from "svelte-tiny-router";
  import * as NavigationMenu from "$lib/shadcn/ui/navigation-menu";
  //import NavigationMenu from "$lib/shadcn/ui/navigation-menu/navigation-menu.svelte";
  //import NavigationMenuList from "$lib/shadcn/ui/navigation-menu/navigation-menu-list.svelte";

  const router = useTinyRouter();
  const navigate = (route: string) => {
    router.navigate(route);
  };

  navigate("/run");
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>PiranhaNET</NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.List>
   <NavigationMenu.Item>Run</NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Item>About</NavigationMenu.Item>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>
<!--<nav>
  <button onclick={() => navigate('/run')}>Run</button>
  <button onclick={() => navigate('/about')}>About</button>
</nav>-->
