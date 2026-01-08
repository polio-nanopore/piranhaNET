<script lang="ts">
	import pscLogo from '$lib/images/Poliovirus Sequencing Consortium.png';
</script>

<svelte:head>
	<title>PiranhaNET - About</title>
	<meta name="description" content="About PiranhaNET" />
</svelte:head>

<div class="text-lg">
	<h1>About PiranhaNET</h1>
	<img src={ pscLogo } alt="Poliovirus Sequencing Consortium" class="float-right pr-4" />
	<p>
		PiranhaNET is the graphical user interface for Piranha, the Polio Direct Detection by Nanopore Sequencing (DDNS)
		analysis pipeline and reporting tool.
	</p>
	<p>
		PiranhaNET has been developed by the <a href="https://polionanopore.org/" target="_blank">Poliovirus Sequencing Consortium</a>, supported by grants from the Bill and
		Melinda Gates Foundation and the Wellcome Trust.
	</p>
	<p>
		This is open-source software.<br/>
		<a href="https://github.com/polio-nanopore/piranhaNET/" target="_blank">Github repository for PiranhaNET</a> <br/>
		<a href="https://github.com/polio-nanopore/piranha" target="_blank">Github repository for Piranha</a>
	</p>
</div>

<style>
	p {
		margin-bottom: 0.4rem;
	}
</style>
