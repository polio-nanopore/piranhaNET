<script lang="ts">
	import { Accordion, AccordionItem, Button, Checkbox, Fileupload, Input, Label, Textarea } from "flowbite-svelte";
	import { loadSettings, saveSettings } from "../settingsStore.ts";
	import type {AppSettings} from "../settingsStore.ts";
	import Info from "./components/Info.svelte";
	import Settings from "./components/Settings.svelte";
	import RunInfo from "./components/RunInfo.svelte";

	let name = $state("");
	let barcodesFile = $state<FileList | null>(null);
	let minKnowFolder = $state<FileList | null>(null);

	let runStarted = $state(false);

	let settings = $state(loadSettings());
	let saveSettingsOnRun = $state(true);
	let startRun = () => {
		if (saveSettingsOnRun) {
			saveSettings(settings as AppSettings);
		}
		runStarted = true;
	};
	let settingsChanged = () => {};

	let enableRun = $derived(!!(name && barcodesFile?.length && minKnowFolder?.length));
</script>

<svelte:head>
	<title>PiranhaNET - Run</title>
	<meta name="description" content="PiranhaNET - Run" />
</svelte:head>

<div>
	<h1>New Sequencing Run</h1>
	{#if !runStarted}
	<form>
		<div class="grid gap-6">
		    <div>
			    <Info tooltip="Enter a unique name for this sequencing run"></Info>
			    <Label for="name" class="text-base">Name</Label>
			    <Input type="text" id="name" required bind:value={name}></Input>
		    </div>
			<div>
				<Info tooltip="Select a CSV file containing the IDs and barcodes for each sample"></Info>
				<Label for="barcodes_file" class="text-base">Barcodes file</Label>
				<Fileupload id="barcodes_file" accept=".csv" required bind:files={barcodesFile}></Fileupload>
				<Button class="primary-button float-right mt-3 p-2" size="sm" disabled={!barcodesFile?.length}>View barcodes file</Button>
			</div>
			<div class="customInputContainer">
				<Info tooltip="Select the folder containing sample sequencing reads from MinKnow"></Info>
				<Label for="minknow_folder" class="text-base">MinKnow folder</Label>
				<!--<Fileupload id="minknow_folder" webkitdirectory="true" class="customFileInput" directory required bind:files={minKnowFolder}/>-->
				<input type="file" id="minknow_folder" webkitdirectory="true" style="width: 1010px;" class="disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 rounded-lg border p-0! dark:text-gray-400 text-sm p-2.5 customFileInput" directory required bind:files={minKnowFolder}/><label htmlFor="minknow_folder" class="customFileInputButton">Choose Folder</label>
			</div>
			<div>
				<Info tooltip="Notes will be saved to the output report"></Info>
				<Label for="notes" class="text-base">Notes</Label>
				<Textarea id="notes" class="w-full" rows="4"></Textarea>
			</div>
			<div>
				<Info tooltip="Number of parallel threads Piranha will use for this run"></Info>
				<Label for="analysis_threads" class="text-base">Analysis threads</Label>
				<Input type="number" id="analysis_threads" value="10" required></Input>
			</div>
			<div class="accordion-content">
				<Accordion>
					<AccordionItem>
						{#snippet header()}Settings{/snippet}
							<Settings bind:settings={settings} settingsChanged={settingsChanged}></Settings>
							<div class="mt-6">
								<Checkbox bind:checked={saveSettingsOnRun} color="orange">Update settings for future runs</Checkbox>
							</div>

					</AccordionItem>
				</Accordion>
			</div>
			<div>
				<Button class="primary-button float-right" onclick={startRun} disabled={!enableRun}>Start Run</Button>
			</div>
		</div>
	</form>
	{:else}
		<RunInfo name={name} barcodesFile={barcodesFile[0].name} minKnowFolder={minKnowFolder[0].name}></RunInfo>
	{/if}
</div>

<style>
	.customFileInput::-webkit-file-upload-button {
		visibility: hidden;
		width: 0px;
	}

	.customInputContainer {
		float: left;
		position: relative;
		height: 80px;
	}

	.customFileInput {
		position: absolute;
		top: 24px;
		left: 74px;
		margin-left: 0!important;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	.customFileInputButton {
		position: absolute;
		background-color: #1e2939;
		color: white;
		height: 42px;
		padding-top: 12px;
		padding-bottom: 12px;
		padding-left: 8px;
		padding-right: 8px;
		margin-right: 0!important;
		border-top-left-radius: 8px;
		border-bottom-left-radius: 8px;
		font-size: 14px;
	}

</style>
