<script lang="ts">
  import * as NavigationMenu from "$lib/shadcn/ui/navigation-menu";
  import * as DropdownMenu from "$lib/shadcn/ui/dropdown-menu";
  import {ChevronDown} from "@lucide/svelte";
  import { i18n } from "../../lib/i18n.svelte";
</script>

<NavigationMenu.Item class="hidden md:block">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
       <NavigationMenu.Link class="nav-link rounded-none">{i18n.lang} <ChevronDown></ChevronDown></NavigationMenu.Link>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="rounded-none min-w-16 mr-2">
      <DropdownMenu.Group>
        {#each i18n.allLanguages as lang (lang)}
          <DropdownMenu.CheckboxItem class="dropdown-item text-xl" checked={lang === i18n.lang} onSelect={() => i18n.lang = lang}>
            { lang }
          </DropdownMenu.CheckboxItem>
        {/each}
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</NavigationMenu.Item>
