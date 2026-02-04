<script>
    import {Accordion, AccordionItem, Checkbox, Fileupload, Input, Label, Select, Toggle} from "flowbite-svelte";

    // TODO: bind all values to settings
    // TODO: remove settingsChanged
    let {settings, settingsChanged} = $props();

    import Info from "./Info.svelte";
    const orientations = [
        {value: "vertical", name: "Vertical"},
        {value: "horizontal", name: "Horizontal"},
    ];
    const protocols = [
        {value: "stool", name: "Stool"},
        {value: "environmental", name: "Environmental"},
        {value: "isolate", name: "Isolate"}
    ];

</script>
<div class="accordion-content">
<Accordion>
    <AccordionItem open>
        {#snippet header()}Run Settings{/snippet}
        <div class="grid gap-6">
            <div class="customInputContainer">
                <Info tooltip="Select a folder for the output of Piranha analysis"></Info>
                <Label for="output_folder" class="text-base">Output folder</Label>
                <input type="file" id="output_folder" style="width: 928px;" webkitdirectory="true" class="disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 rounded-lg border p-0! dark:text-gray-400 text-sm p-2.5 customFileInput" directory required/><label htmlFor="output_folder" class="customFileInputButton">Choose Folder</label>
            </div>
            <div>
                <Info tooltip="User name to appear in report"></Info>
                <Label for="user_name" class="text-base">User name</Label>
                <Input type="text" bind:value={settings.userName} id="user_name" onchange={() => settingsChanged(settings)}></Input>
            </div>
            <div>
                <Info tooltip="Institute name to appear in report"></Info>
                <Label for="institute" class="text-base">Institute</Label>
                <Input type="text" bind:value={settings.institute} id="institute"></Input>
            </div>
            <div>
                <Info tooltip="Orientation of barcodes in wells on a 96-well plate. If 'well' is supplied as a column in the barcodes csv file, this default orientation will be overwritten."></Info>
                <Label for="orientation" class="text-base">Orientation</Label>
                <Select items={orientations} bind:value={settings.orientation}></Select>
            </div>
            <div>
                <Info tooltip="Sample type"></Info>
                <Label for="protocl" class="text-base">Protocol</Label>
                <Select items={protocols} bind:value={settings.protocol}></Select>
            </div>
            <div>
                <Info tooltip="Sample name of positive control"></Info>
                <Label for="positive_control" class="text-base">Positive control</Label>
                <Input type="text" id="positive_control" bind:value={settings.positiveControl}></Input>
            </div>
            <div>
                <Info tooltip="Sample name of negative control"></Info>
                <Label for="negative_control" class="text-base">Negative control</Label>
                <Input type="text" id="negative_control" bind:value={settings.negativeControl}></Input>
            </div>
        </div>
    </AccordionItem>
    <AccordionItem>
        {#snippet header()}Piranha Output Settings{/snippet}
        <div class="grid gap-6">
            <div>
                <Label for="publish_folder" class="text-base">Publish folder</Label>
                <Input type="text" id="publish_folder" bind:value={settings.publishFolder}></Input>
            </div>
            <div>
                <Label for="output_prefix" class="text-base">Output prefix</Label>
                <Input type="text" id="output_prefix" bind:value={settings.outputPrefix}></Input>
            </div>
        </div>
        <div class="grid grid-cols-4 mt-6">
            <Toggle class="text-base" color="orange" bind:checked={settings.overwriteOutput}>Overwrite output</Toggle>
            <Toggle class="text-base" color="orange" bind:checked={settings.outputIntermediateFiles}>Output intermediate files</Toggle>
            <Toggle class="text-base" color="orange" bind:checked={settings.allMetadataToHeader}>All metadata to header</Toggle>
            <Toggle class="text-base" color="orange" bind:checked={settings.dateStamp}>Date stamp</Toggle>
        </div>
    </AccordionItem>
    <AccordionItem>
        {#snippet header()}Piranha Analysis Settings{/snippet}
        <div class="grid gap-6">
            <div>
                <Label for="analysis_mode" class="text-base">Analysis mode</Label>
                <Input type="text" id="analysis_mode" bind:value={settings.analysisMode}></Input>
            </div>
            <div>
                <Label for="medaka_model" class="text-base">Medaka model</Label>
                <Input type="text" id="medaka_model" bind:value={settings.medakaModel}></Input>
            </div>
            <div>
                <Label for="min_mapping_quality" class="text-base">Minimum mapping quality</Label>
                <Input type="number" id="min_mapping_quality" bind:value={settings.minMappingQuality}></Input>
            </div>
            <div>
                <Label for="min_read_length" class="text-base">Minimum read length</Label>
                <Input type="number" id="min_read_length" bind:value={settings.minReadLength}></Input>
            </div>
            <div>
                <Label for="max_read_length" class="text-base">Maximum read length</Label>
                <Input type="number" id="max_read_length" bind:value={settings.maxReadLength}></Input>
            </div>
            <div>
                <Label for="min_read_depth" class="text-base">Minimum read depth</Label>
                <Input type="number" id="min_read_depth" bind:value={settings.minReadDepth}></Input>
            </div>
            <div>
                <Label for="min_read_percentage" class="text-base">Minimum read percentage</Label>
                <Input type="number" id="min_read_percentage" bind:value={settings.minReadPercentage}></Input>
            </div>
            <div>
                <Label for="primer_length" class="text-base">Primer length</Label>
                <Input type="number" id="primer_length" bind:value={settings.primerLength}></Input>
            </div>
        </div>
    </AccordionItem>
</Accordion>
</div>