<script lang="ts">
  import {useTinyRouter} from "svelte-tiny-router";
  import * as NavigationMenu from "$lib/shadcn/ui/navigation-menu";

  const router = useTinyRouter();
  const navigate = (route: string) => {
    router.navigate(route);
  };

  const isCurrentRoute = (route) => route == router.path;

  navigate("/run");
</script>

<NavigationMenu.Root class="bg-primary text-primary-foreground max-w-full justify-between text-2xl">
  <NavigationMenu.List>
    <NavigationMenu.Item class="pn-title">PiranhaNET</NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Link class="nav-link rounded-none {isCurrentRoute('/run') ? 'current-nav-route' : ''}"
                           onSelect={() => navigate('/run')}>Run</NavigationMenu.Link>
    </NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Link class="nav-link rounded-none {isCurrentRoute('/about') ? 'current-nav-route' : ''}"
                           onSelect={() => navigate('/about')}>About</NavigationMenu.Link>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>
<div>path: {router.path}</div>

