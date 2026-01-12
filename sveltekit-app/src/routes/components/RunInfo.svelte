<script>
    import { goto } from '$app/navigation';
    import { Button, Spinner } from "flowbite-svelte";
    import CheckCircle from "./CheckCircle.svelte";

    let { name, barcodesFile, minKnowFolder } = $props();

    let logs = $state(["Initialising", "Waiting for logs..."]);
    let status = $state("running");
    let interval = 0;
    let addFakeLog = () => {
        logs.push("doing Piranha stuff...");
        if (logs.length > 6) {
            logs.push("Piranha completed successfully!");
            status = "complete";
            clearInterval(interval);
        }
    };
    interval = setInterval(addFakeLog, 1000);
</script>

<div class={`status status-${status}`}>
    <h2>
        { name }
        {#if status==="complete"}
            <CheckCircle></CheckCircle>
        {:else}
            <Spinner color="orange" size="5" />
        {/if}
    </h2>
    <div style="position: relative;">
        <p>Barcodes file: <strong>{barcodesFile}</strong></p>
        <p>MinKnow folder: <strong>/{minKnowFolder}</strong></p>
        <p>Output folder: <strong>/home/piranha/{name}/output</strong></p>
        {#if status==="complete"}
          <Button class="primary-button open-report"
                  onclick={() => goto('/output-report')}
                  style="position: absolute; bottom: 0; right: 0; cursor: pointer;">
              Open report
          </Button>
        {/if}
    </div>
    <div class="logs">
        <div class="pb-3"><strong>Logs</strong></div>
        <pre>{logs.join("\n")}</pre>
    </div>
</div>

<style>
    div.status {
        width: 60rem;
        padding: 2rem;
        margin-top: 1rem;
        border-width: 1px;
        border-radius: 0.3rem;
        background-color: white;
    }

    div.status-complete {
        border-color: rgb(74 222 128);
    }

    div.status-running {
        border-color: orange;
    }

    div.logs {
        margin-top: 0.5rem;
        background-color: black;
        color: white;
        padding: 0.5rem;
        height: 70vh;
    }
</style>