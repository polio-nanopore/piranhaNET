<script lang="ts">
  import Versions from './components/Versions.svelte'
  import piranhaLogo from './assets/piranha.svg'

  const ipcHandle = (): void => window.electron.ipcRenderer.send('run-piranha')
</script>

<img alt="logo" class="logo" src={piranhaLogo} />
<div class="creator">Powered by electron-vite</div>
<div class="text">
  PiranhaNET
</div>
<div class="actions">
  <div class="action">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions a11y-missing-attribute-->
    <a target="_blank" rel="noreferrer" on:click={ipcHandle}>Run Piranha</a>
  </div>
</div>
<Versions />
