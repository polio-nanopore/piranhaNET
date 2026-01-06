<script lang="ts">
	import { resolve } from '$app/paths';
	import Settings from "../components/Settings.svelte";
	import {Button} from "flowbite-svelte";
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
		<Settings></Settings>
		<div>
			<Button class="primary-button float-right">Save</Button>
		</div>
	</div>
</div>
