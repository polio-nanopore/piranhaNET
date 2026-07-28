<script lang="ts">
  import { onMount } from "svelte";
  import pscLogo from "../../assets/psc-logo.svg";
  import articLogo from "../../assets/artic-logo.svg";
  import githubLogo from "../../assets/github-logo.svg";
  import { piranhaAPI } from "$lib/piranhaAPI.svelte";
  import { m } from "../../paraglide/messages";
  import type { PiranhaVersions } from "../../shared/types";
  import I18nMessageWithLinks from "../I18nMessageWithLinks.svelte";

  const grants = [
    {
      img: pscLogo,
      name: "Poliovirus Sequencing Consortium",
      details: "Bill & Melinda Gates Foundation OPP1171890 and OPP1207299",
    },
    {
      img: articLogo,
      name: "ARTIC network",
      details: "Wellcome Trust Award 206298/Z/17/Z",
    },
  ];

  const githubRepos = [
    { name: "Piranha", url: "https://github.com/polio-nanopore/piranha" },
    { name: "PiranhaNET", url: "https://github.com/polio-nanopore/piranhaNET" },
  ];

  const credits = [
    {
      product: "Piranha",
      names: [
        "Áine O’Toole",
        "Rachel Colquhoun",
        "Corey Ansley",
        "Zoe Vance",
        "Andrew Rambaut",
      ],
    },
    {
      product: "PiranhaNET",
      names: [
        "Emma Russell",
        "David Mears",
        "Wes Hinsley",
        "RESIDE Team at Imperial College School of Public Health",
      ],
    },
    {
      product: "Polio Direct Detection by Nanopore Sequencing (DDNS)",
      names: [
        "Alexander G. Shaw",
        "Manasi Majumdar",
        "Catherine Troman",
        "Áine O’Toole",
        "Blossom Benny",
        "Dilip Abraham",
        "Ira Praharaj",
        "Gagandeep Kang",
        "Salmaan Sharif",
        "Muhammad Masroor Alam",
        "Shahzad Shaukat",
        "Mehar Angez",
        "Adnan Khurshid",
        "Nayab Mahmood",
        "Yasir Arshad",
        "Lubna Rehman",
        "Ghulam Mujtaba",
        "Ribqa Akthar",
        "Muhammad Salman",
        "Dimitra Klapsa",
        "Yara Hajarha",
        "Humayun Asghar",
        "Ananda Bandyopadhyay",
        "Andrew Rambaut",
        "Javier Martin",
        "Nicholas Grassly",
      ],
    },
  ];

  let versions: PiranhaVersions | null = $state(null);

  onMount(async () => {
    versions = await piranhaAPI.piranhaVersions();
  });
</script>

<div class="container mx-auto">
  <div
    id="scrolling-container"
    class="max-h-[calc(100vh-10rem)] overflow-y-auto p-4 space-y-4"
  >
    <h1 class="mb-4" data-testid="about-header">{m.aboutHeader()}</h1>
    <div data-testid="versions" class="text-xl">
      <p>Piranha v{versions?.piranha}</p>
      <p>PiranhaNET v{versions?.piranhaNET}</p>
    </div>
    <p>{m.aboutDescription()}</p>
    <I18nMessageWithLinks messageKey="aboutDevelopment"></I18nMessageWithLinks>
    <p>{m.aboutHistory()}</p>
    <div class="flex flex-wrap space-x-6" data-testid="about-grants">
      {#each grants as grant (grant.name)}
        <div class="w-[500px] bg-white flex mt-3">
          <img class="w-[200px]" src={grant.img} alt={grant.name} />
          <div class="pt-6 space-y-3">
            <div class="text-xl">{grant.name}</div>
            <div>{m.aboutSupportedBy()} {grant.details}</div>
          </div>
        </div>
      {/each}
    </div>
    <div data-testid="about-github">
      This is open-source software.
      {#each githubRepos as repo (repo.name)}
        <div class="flex space-x-2 mt-1">
          <img class="w-[24px]" src={githubLogo} alt="GitHub logo" />
          <!-- eslint-disable svelte/no-navigation-without-resolve -->
          <a target="_blank" class="text-blue-600" href={repo.url}
            >{m.aboutGithubRepoFor()} {repo.name}</a
          >
        </div>
      {/each}
    </div>

    <div class="space-y-3" data-testid="about-credits">
      <h2>{m.aboutCredits()}</h2>
      {#each credits as credit (credit.product)}
        <div>
          <h3>{credit.product}</h3>
          {credit.names.join(", ")}
        </div>
      {/each}
    </div>
  </div>
</div>
