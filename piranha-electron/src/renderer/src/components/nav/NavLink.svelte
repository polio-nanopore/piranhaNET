<script lang="ts">
  import * as NavigationMenu from "$lib/shadcn/ui/navigation-menu";
  import { m } from "../../../../paraglide/messages";

  let {route, textKey, router} = $props();
  const navigate = (route: string) => {
    router.navigate(route);
  };

  const isCurrentRoute = (route) => route == router.path;

</script>

<NavigationMenu.Item>
  <NavigationMenu.Link class="nav-link rounded-none {isCurrentRoute(route) ? 'current-nav-route' : ''}"
                       onSelect={() => navigate(route)}>{m[textKey]()}</NavigationMenu.Link>
</NavigationMenu.Item>


