<script lang="ts">
  import * as ansi_up from "ansi_up";
  import { m } from "../../paraglide/messages.js";
  // TODO: put this in a separte module which sets locale and also saves to local storage
  import Versions from "./components/Versions.svelte";
  import piranhaLogo from "./assets/piranha.svg";
  import {updateLang, i18n} from "./lib/i18n.svelte"

  const ansi = new ansi_up.AnsiUp();

  let initialized = $state(false);
  let log = $state([]);
  const decoder = new TextDecoder("utf-8");

  const runPiranha = (): void => {
    log = [];
    window.electron.ipcRenderer.send("run-piranha");
  };

  const toggleLanguage = () => {
    //const locale = getLocale();
    //const newLocale = locale == "en" ? "fr" : "en";
    //console.log(`Setting to ${newLocale}`);
    updateLang();
  };

  window.api?.onInitialized(() => {
    initialized = true;
  });
  window.api?.onChunk((chunk) => {
    const textChunk = decoder.decode(chunk, { stream: true });
    log.push(`${textChunk}`);
  });
  window.api?.onEnd(() => {
    log.push("Piranha Run Finished");
  });

  const testMessageMain = (): void => {
    // Prove that we can still message main while piranha is running
    // - should see it log a message to the console
    window.electron.ipcRenderer.send("test-message");
  };
</script>

<img alt="logo" class="logo" src={piranhaLogo} />
<div class="text">PiranhaNET</div>
{#key i18n.lang}
<div>{ m.welcome() }</div>
{#if initialized}
  <div class="actions">
    <button class="action" onclick={runPiranha}>Run Piranha</button>
    <button class="action" onclick={toggleLanguage}>{ m.toggleLanguage() }</button>
    <span>{i18n.lang}</span>
  </div>
  <code
    style="height: 100px; width: 600px; overflow: scroll; background-color: white; color: black; margin-top: 16px;"
    data-testid="log"
  >
    {#each log as logentry, index (index)}
      <!-- eslint-disable  svelte/no-at-html-tags -->
      {@html ansi.ansi_to_html(logentry)}<br />
    {/each}
  </code>
  <button class="action" onclick={testMessageMain}> Test Message Main </button>
{:else}
  Initializing...
{/if}
{/key}
<Versions />
