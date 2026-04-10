<script lang="ts">
  import * as NavigationMenu from "$lib/shadcn/ui/navigation-menu";
  import { m } from "../../../../paraglide/messages";

  let {route, textKey, router} = $props();
  const navigate = (route: string): void => {
    router.navigate(route);
  };

  const isCurrentRoute = (route): boolean => route == router.path;

</script>

<NavigationMenu.Item>
  <NavigationMenu.Link class="nav-link rounded-none {isCurrentRoute(route) ? 'current-nav-route' : ''}"
                       data-testid={`nav-${textKey}`}
                       onSelect={() => navigate(route)}>{m[textKey]()}</NavigationMenu.Link>
</NavigationMenu.Item>


