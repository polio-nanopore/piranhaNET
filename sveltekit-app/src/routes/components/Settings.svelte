<script>
    import { Fileupload, Input, Label, Select } from "flowbite-svelte";
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

<div class="grid gap-6">
    <div>
        <Info tooltip="Select a folder for the output of Piranha analysis"></Info>
        <Label for="output_folder" class="text-base">Output folder</Label>
        <Fileupload id="output_folder" webkitdirectory="true" directory required></Fileupload>
    </div>
    <div>
        <Info tooltip="User name to appear in report"></Info>
        <Label for="user_name" class="text-base">User name</Label>
        <Input type="text" id="user_name"></Input>
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