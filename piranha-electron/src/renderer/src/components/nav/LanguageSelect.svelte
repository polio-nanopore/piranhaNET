<script lang="ts">
  import * as NavigationMenu from "$lib/shadcn/ui/navigation-menu";
  import * as DropdownMenu from "$lib/shadcn/ui/dropdown-menu";
  import { ChevronDown } from "@lucide/svelte";
  import { i18n } from "$lib/i18n.svelte";

  const closeContent = (event): void => {
    // This handler is to work around a bug in shadcn which causes "pointer-events: none;" to be left on <body> after
    // dropdown content has been opened. This is maintly an issue for unit tests as testing-library cleanup re-uses body.
    // See https://github.com/shadcn-ui/ui/issues/7575
    event.preventDefault();
    document.body.style.pointerEvents = "";
  };
</script>

<NavigationMenu.Item class="hidden md:block">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <NavigationMenu.Link class="nav-link rounded-none"
        >{i18n.lang} <ChevronDown></ChevronDown></NavigationMenu.Link
      >
    </DropdownMenu.Trigger>
    <DropdownMenu.Content
      data-testid="lang-select-content"
      class="rounded-none min-w-16 mr-2"
      onCloseAutoFocus={closeContent}
    >
      <DropdownMenu.Group>
        {#each i18n.allLanguages as lang (lang)}
          <DropdownMenu.CheckboxItem
            class="dropdown-item text-xl"
            checked={lang === i18n.lang}
            onSelect={() => (i18n.lang = lang)}
            data-testid={`lang-${lang}`}
          >
            {lang}
          </DropdownMenu.CheckboxItem>
        {/each}
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</NavigationMenu.Item>
