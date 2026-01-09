<script lang="ts">
	import Settings from "../components/Settings.svelte";
	import {Button} from "flowbite-svelte";

	const settingsState = {
		outputFolder: "",
		userName: ""
	}; // TODO: get from localstorage
	let settings = $state(settingsState);
	const settingsChanged = (newSettings) => {
		console.log("settings changed");
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
		<Settings settings={settings} settingsChanged={settingsChanged}></Settings>
		<div>
			<Button class="primary-button float-right">Save</Button>
		</div>
	</div>
</div>
