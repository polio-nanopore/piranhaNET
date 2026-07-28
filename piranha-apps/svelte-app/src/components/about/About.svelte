<script>
  import pscLogo from "../../assets/psc-logo.svg";
  import articLogo from "../../assets/artic-logo.svg";
  import githubLogo from "../../assets/github-logo.svg";

  const grants = [
    {img: pscLogo, name: "Poliovirus Sequencing Consortium", details: "Bill & Melinda Gates Foundation OPP1171890 and OPP1207299"},
    {img: articLogo, name: "ARTIC network", details: "Wellcome Trust Award 206298/Z/17/Z"}
  ];

  const githubRepos = [
    {name: "Piranha", url:"https://github.com/polio-nanopore/piranha"},
    {name: "PiranhaNET", url: "https://github.com/polio-nanopore/piranhaNET"}
  ];

  const credits = [
    {
      product: "Piranha",
      names: ["Áine O’Toole", "Rachel Colquhoun", "Corey Ansley", "Zoe Vance", "Andrew Rambaut"]
    },
    {
      product: "PiranhaNET",
      names: ["Emma Russell", "David Mears", "Wes Hinsley", "RESIDE Team at Imperial College School of Public Health"]
    },
    {
      product: "Polio Direct Detection by Nanopore Sequencing (DDNS)",
      names: ["Alexander G. Shaw", "Manasi Majumdar", "Catherine Troman", "Áine O’Toole", "Blossom Benny",
      "Dilip Abraham", "Ira Praharaj", "Gagandeep Kang", "Salmaan Sharif", "Muhammad Masroor Alam",
      "Shahzad Shaukat", "Mehar Angez", "Adnan Khurshid", "Nayab Mahmood", "Yasir Arshad", "Lubna Rehman",
      "Ghulam Mujtaba", "Ribqa Akthar", "Muhammad Salman", "Dimitra Klapsa", "Yara Hajarha", "Humayun Asghar",
      "Ananda Bandyopadhyay", "Andrew Rambaut", "Javier Martin", "Nicholas Grassly"]
    }
  ];
</script>

<div class="container mx-auto">
  <div
    id="scrolling-container"
    class="max-h-[calc(100vh-10rem)] overflow-y-auto p-4 space-y-4"
  >
  <h1 class="mb-4" data-testid="about">About PiranhaNET</h1>
  <div data-testid="versions" class="text-xl">
    <p>Piranha v</p>
    <p>PiranhaNET v</p>
  </div>
  <p>
    PiranhaNET is the graphical user interface for Piranha, the Polio Direct Detection by Nanopore Sequencing (DDNS) analysis pipeline and reporting tool.
  </p>
  <p>
    Piranha and PiranhaNET have been developed by the <a target="_blank" class="text-blue-600" href="https://polionanopore.org/">Poliovirus Sequencing Consortium</a>, supported by the Bill and Melinda Gates Foundation, and by the <a target="_blank" class="text-blue-600" href="https://artic.network">ARTIC network</a>, supported by the Wellcome Trust.
  </p>
  <p>
    PiranhaNET is based on, and replaces, PiranhaGUI.
  </p>
  <div class="flex flex-wrap space-x-6">
    {#each grants as grant}
      <div class="w-[500px] bg-white flex mt-3">
        <img class="w-[200px]" src={grant.img}/>
        <div class="pt-6 space-y-3">
          <div class="text-xl">{grant.name}</div>
          <div>Supported by {grant.details}</div>
        </div>
      </div>
    {/each}
  </div>
  <div>
    This is open-source software.
    {#each githubRepos as repo}
      <div class="flex space-x-2 mt-1">
        <img class="w-[24px]" src={githubLogo} alt="GitHub logo">
        <a target="_blank" class="text-blue-600" href={repo.url}>GitHub repository for {repo.name}</a>
      </div>
    {/each}
  </div>
  <h2>Credits</h2>
  {#each credits as credit}
    <h3>{credit.product}</h3>
    <p>
      {credit.names.join(", ")}
    </p>
  {/each}
  </div>
</div>
