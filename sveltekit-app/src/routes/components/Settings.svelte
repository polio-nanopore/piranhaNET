<script>
    import {Accordion, AccordionItem, Checkbox, Fileupload, Input, Label, Select, Toggle} from "flowbite-svelte";

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

<Accordion>
    <AccordionItem open>
        {#snippet header()}Run Settings{/snippet}
        <div class="grid gap-6">
            <div>
                <Info tooltip="Select a folder for the output of Piranha analysis"></Info>
                <Label for="output_folder" class="text-base">Output folder</Label>
                <Fileupload id="output_folder" bind:value={settings.outputFolder} webkitdirectory="true" directory required></Fileupload>
            </div>
            <div>
                <Info tooltip="User name to appear in report"></Info>
                <Label for="user_name" class="text-base">User name</Label>
                <Input type="text" bind:value={settings.userName} id="user_name" onchange={() => settingsChanged(settings)}></Input>
            </div>
            <div>
                <Info tooltip="Institute name to appear in report"></Info>
                <Label for="institute" class="text-base">Institute</Label>
                <Input type="text" id="institute"></Input>
            </div>
            <div>
                <Info tooltip="Orientation of barcodes in wells on a 96-well plate. If 'well' is supplied as a column in the barcodes csv file, this default orientation will be overwritten."></Info>
                <Label for="orientation" class="text-base">Orientation</Label>
                <Select items={orientations} value="vertical"></Select>
            </div>
            <div>
                <Info tooltip="Sample type"></Info>
                <Label for="protocl" class="text-base">Protocol</Label>
                <Select items={protocols} value="stool"></Select>
            </div>
            <div>
                <Info tooltip="Sample name of positive control"></Info>
                <Label for="positive_control" class="text-base">Positive control</Label>
                <Input type="text" id="positive_control"></Input>
            </div>
            <div>
                <Info tooltip="Sample name of negative control"></Info>
                <Label for="negative_control" class="text-base">Negative control</Label>
                <Input type="text" id="negative_control"></Input>
            </div>
        </div>
    </AccordionItem>
    <AccordionItem>
        {#snippet header()}Piranha Output Settings{/snippet}
        <div class="grid gap-6">
            <div>
                <Label for="publish_directory" class="text-base">Publish directory</Label>
                <Input type="text" id="publish_directory"></Input>
            </div>
            <div>
                <Label for="output_prefix" class="text-base">Output prefix</Label>
                <Input type="text" id="output_prefix" value="analysis"></Input>
            </div>
        </div>
        <div class="grid grid-cols-4 mt-6">
            <Toggle class="text-base" color="orange">Overwrite output</Toggle>
            <Toggle class="text-base" color="orange">Output intermediate files</Toggle>
            <Toggle class="text-base" color="orange">All metadata to header</Toggle>
            <Toggle class="text-base" color="orange">Date stamp</Toggle>
        </div>
    </AccordionItem>
    <AccordionItem>
        {#snippet header()}Piranha Analysis Settings{/snippet}
        <div class="grid gap-6">
            <div>
                <Label for="analysis_mode" class="text-base">Analysis mode</Label>
                <Input type="text" id="analysis_mode" value="vp1"></Input>
            </div>
            <div>
                <Label for="medaka_model" class="text-base">Medaka model</Label>
                <Input type="text" id="medaka_model" value="r941_min_hac_variant_g507"></Input>
            </div>
            <div>
                <Label for="min_mapping_quality" class="text-base">Minimum mapping quality</Label>
                <Input type="number" id="min_mapping_quality" value="0"></Input>
            </div>
            <div>
                <Label for="min_read_length" class="text-base">Minimum read length</Label>
                <Input type="number" id="min_read_length" value="1000"></Input>
            </div>
            <div>
                <Label for="max_read_length" class="text-base">Maximum read length</Label>
                <Input type="number" id="max_read_length" value="1300"></Input>
            </div>
            <div>
                <Label for="min_read_depth" class="text-base">Minimum read depth</Label>
                <Input type="number" id="min_read_depth" value="50"></Input>
            </div>
            <div>
                <Label for="min_read_percentage" class="text-base">Minimum read percentage</Label>
                <Input type="number" id="min_read_percentage" value="0"></Input>
            </div>
        </div>
    </AccordionItem>
</Accordion>