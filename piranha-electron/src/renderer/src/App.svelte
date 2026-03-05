<script lang="ts">
  import Versions from "./components/Versions.svelte";
  import piranhaLogo from "./assets/piranha.svg";

  let log = $state([]);
  const decoder = new TextDecoder('utf-8');

  const runPiranha = (): void => {
    log = [];
    window.electron.ipcRenderer.send("run-piranha");
  }
  window.api?.onChunk((chunk) => {
    const textChunk = decoder.decode(chunk, { stream: true });
    log.push(`${textChunk}`);
  });
  window.api?.onEnd(() => {
      log.push("Piranha Run Finished");
    }
  );

  const testMessageMain = (): void => {
    // Prove that we can still message main while piranha is running
    // - should see it log a message to the console
    window.electron.ipcRenderer.send("test-message");
  }
</script>

<img alt="logo" class="logo" src={piranhaLogo} />
<div class="text">PiranhaNET</div>
<div class="actions">
  <button class="action" onclick={runPiranha}>Run Piranha</button>
</div>
<pre style="height: 100px; width: 600px; overflow: scroll; background-color: white; color: black; margin-top: 16px;">
  {log.join("\n")}
</pre>
<button class="action" onclick={testMessageMain}>
  Test Message Main
</button>
<Versions />
