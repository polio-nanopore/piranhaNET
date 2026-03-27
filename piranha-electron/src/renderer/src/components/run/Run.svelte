<script lang="ts">
  import { m } from "../../../../paraglide/messages";
  import { i18n } from "../../lib/i18n.svelte";
  import * as ansi_up from "ansi_up";
  import {piranhaAPI} from "../../lib/piranhaAPI.svelte";

  const ansi = new ansi_up.AnsiUp();
</script>
<div class="container mx-auto p-4">
  <div data-testid="welcome">{m.welcome()}</div>
  <div class="actions">
    <button class="action" onclick={() => piranhaAPI.runPiranha()} data-testid="run">{m.runPiranha()}</button>
  </div>
  <code
    style="height: 100px; width: 600px; overflow: scroll; background-color: white; color: black; margin-top: 16px;"
    data-testid="log"
  >
    {#each piranhaAPI.log as logentry, index (index)}
      <!-- eslint-disable  svelte/no-at-html-tags -->
      {@html ansi.ansi_to_html(logentry)}<br />
    {/each}
  </code>
  <button class="action" onclick={() => piranhaAPI.testMessageMain()} data-testid="test-msg">
    {m.testMessageMain()}
  </button>
  <div>
    <label for="lang">{m.language()}</label>
    <select id="lang" data-testid="lang" bind:value={i18n.lang}>
      {#each i18n.allLanguages as lang (lang)}
        <option value={lang}>{lang}</option>
      {/each}
    </select>
  </div>
</div>
