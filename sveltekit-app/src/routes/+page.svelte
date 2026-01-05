<script>
	import { Input, Label } from "flowbite-svelte";
	import Info from "./components/Info.svelte";
</script>

<svelte:head>
	<title>Piranha Run</title>
	<meta name="description" content="PiranhaNET Home" />
</svelte:head>

<div>
	<h1>New Sequencing Run</h1>

	<form>
		<div class="grid gap-6">
		  <div>
			  <Info tooltip="Enter a unique name for this sequencing run"></Info>
			  <Label for="name" class="text-base">Name</Label>
			  <Input type="text" id="name" required></Input>
		  </div>
		</div>
	</form>
</div>
