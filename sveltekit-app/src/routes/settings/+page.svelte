<script lang="ts">
	import { loadSettings, saveSettings } from "../../settingsStore";
	import Settings from "../components/Settings.svelte";
	import {Button} from "flowbite-svelte";

	let settings = $state(loadSettings());
	// TODO: I don't thing we need settingsChanged - save on Save click in Settings page, and on Run in index - but
	// use this for testing for now
	const settingsChanged = (newSettings) => {
		console.log("settings changed");
		console.log(JSON.stringify(settings));
	};
</script>

<svelte:head>
	<title>PiranhaNET - Settings</title>
	<meta name="description" content="PiranhaNET Settings" />
</svelte:head>

<div>
	<h1>Settings</h1>
	<div class="grid gap-3">
		<p>
			These settings will be used as defaults in all sequencing runs.
		</p>
		<Settings bind:settings={settings} settingsChanged={settingsChanged}></Settings>
		<div>
			<Button class="primary-button float-right" onclick={saveSettings(settings)}>Save</Button>
		</div>
	</div>
</div>
