<script lang="ts">
  import {useTinyRouter} from "svelte-tiny-router";
  import * as NavigationMenu from "$lib/shadcn/ui/navigation-menu";

  const router = useTinyRouter();
  const navigate = (route: string) => {
    router.navigate(route);
  };

  navigate("/run");
</script>

<NavigationMenu.Root class="bg-primary text-primary-foreground max-w-full justify-between">
  <NavigationMenu.List>
    <NavigationMenu.Item class="pn-title">PiranhaNET</NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.List>
    <NavigationMenu.Item class="nav-link">
      <NavigationMenu.Link onSelect={() => navigate('/run')}>Run</NavigationMenu.Link>
    </NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.List>
    <NavigationMenu.Item class="nav-link">
      <NavigationMenu.Link onSelect={() => navigate('/about')}>About</NavigationMenu.Link>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>

