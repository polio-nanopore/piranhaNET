<script>
	import { Accordion, AccordionItem, Button, Checkbox, Fileupload, Input, Label, Textarea } from "flowbite-svelte";
	import Info from "./components/Info.svelte";
	import Settings from "./components/Settings.svelte";
	import RunInfo from "./components/RunInfo.svelte";
	let runStarted = $state(false);

	let settings = {};
	let settingsChanged = () => {};
</script>

<svelte:head>
	<title>Piranha Run</title>
	<meta name="description" content="PiranhaNET Home" />
</svelte:head>

<div>
	<h1>New Sequencing Run</h1>
	{#if !runStarted}
	<form>
		<div class="grid gap-6">
		    <div>
			    <Info tooltip="Enter a unique name for this sequencing run"></Info>
			    <Label for="name" class="text-base">Name</Label>
			    <Input type="text" id="name" required></Input>
		    </div>
			<div>
				<Info tooltip="Select a CSV file containing the IDs and barcodes for each sample"></Info>
				<Label for="barcodes_file" class="text-base">Barcodes file</Label>
				<Fileupload id="barcodes_file" accept=".csv" required></Fileupload>
			</div>
			<div>
				<Info tooltip="Select the folder containing sample sequencing reads from MinKnow"></Info>
				<Label for="minknow_folder" class="text-base">MinKnow folder</Label>
				<Fileupload id="minknow_folder" webkitdirectory="true" directory required></Fileupload>
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
			<Accordion>
				<AccordionItem>
					{#snippet header()}Settings{/snippet}
					<Settings settings={settings} settingsChanged={settingsChanged}></Settings>
					<div class="mt-6">
						<Checkbox checked color="orange">Update settings for future runs</Checkbox>
					</div>
				</AccordionItem>
			</Accordion>
			<div>
				<Button class="primary-button float-right" onclick={() => runStarted = true}>Start Run</Button>
			</div>
		</div>
	</form>
	{:else}
		<RunInfo></RunInfo>
	{/if}
</div>
