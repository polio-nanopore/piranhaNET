<script lang="ts">
  import Versions from "./components/Versions.svelte";
  import piranhaLogo from "./assets/piranha.svg";

  let log = $state([]);
  const decoder = new TextDecoder('utf-8');

  const runPiranha = (): void => {
    log = [];
    window.electron.ipcRenderer.send("run-piranha");
  }
  window.api.onChunk((chunk) => {
    const textChunk = decoder.decode(chunk, { stream: true });
    log.push(`${textChunk}`);
  });
  window.api.onEnd(() => {
      log.push("Piranha Run Finished");
    }
  );
</script>

<img alt="logo" class="logo" src={piranhaLogo} />
<div class="text">PiranhaNET</div>
<div class="actions">
  <div class="action">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions a11y-missing-attribute-->
    <a target="_blank" rel="noreferrer" on:click={runPiranha}>Run Piranha</a>
  </div>
</div>
<pre style="height: 100px; width: 600px; overflow: scroll; background-color: white; color: black; margin-top: 16px;">
  {log.join("\n")}
</pre>
<Versions />
