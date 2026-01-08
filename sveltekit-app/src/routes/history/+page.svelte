<svelte:head>
	<title>Piranha - Run History</title>
	<meta name="description" content="Run history" />
</svelte:head>

<script lang="ts">
	import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Tooltip } from "flowbite-svelte";
	import CheckCircle from "../components/CheckCircle.svelte";
	import CloseCircle from "../components/CloseCircle.svelte";

	const items = [
		{ name: "barcode_03_rerun", date: Date.UTC(2025, 1, 8), status: "success", outputFolder: "~/piranha/review/barcode_03_rerun" },
		{ name: "barcode_03", date: Date.UTC(2025, 1, 7), status: "failed", outputFolder: "~/piranha/output/barcode_03" },
		{ name: "barcode_02", date: Date.UTC(2025, 1, 7), status: "success",outputFolder: "~/piranha/output/barcode_02" },
		{ name: "barcode_01", date: Date.UTC(2025, 1, 6), status: "success", outputFolder: "~/piranha/output/barcode_01" }
	];
</script>

<div>
	<h1>Run History</h1>
	<Table class="mt-4">
		<TableHead class="text-sm">
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Date</TableHeadCell>
			<TableHeadCell>Status</TableHeadCell>
			<TableHeadCell>Output folder</TableHeadCell>
			<TableHeadCell></TableHeadCell>
			<TableHeadCell></TableHeadCell>
			<TableHeadCell></TableHeadCell>
		</TableHead>
		<TableBody>
			{#each items as item (item.name)}
				<TableBodyRow class="text-base">
					<TableBodyCell>
						<a href="#">{item.name}</a>
						<Tooltip>View logs</Tooltip>
					</TableBodyCell>
					<TableBodyCell>
						{new Date(item.date).toISOString().slice(0, 10)}
					</TableBodyCell>
					<TableBodyCell>
						{#if item.status === "success"}
							<CheckCircle></CheckCircle>
						{:else}
							<CloseCircle></CloseCircle>
						{/if}
						{item.status}
					</TableBodyCell>
					<TableBodyCell>
						{item.outputFolder}
					</TableBodyCell>
					<TableBodyCell>
						<a href="#">View notes</a>
					</TableBodyCell>
					<TableBodyCell>
						<a href="/">Re-run</a>
					</TableBodyCell>
					<TableBodyCell>
						<a href="#">Open report</a>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</div>
