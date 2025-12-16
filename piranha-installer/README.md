# piranhaNET: piranha-installer

[Pyinstaller](https://pyinstaller.org) project for piranha.

`piranha.spec` defines the installer configuration. 

NB For now, we build to a folder, not a single executable, for easier debugging. We will add a "one file" installer
later. 

### Pre-requisites
* [micromamba](https://mamba.readthedocs.io/en/latest/installation/micromamba-installation.html)

### Development

Run all commands from this folder. 

Create a local conda environment (you only need to do this once): `micromamba env create --file environment.yml`

Activate the conda environment: `micromamba activate piranha-installer`

To add a new dependency, update environment.yml then run: `micromamba env update --file environment.yml`

Build piranha to an executable with pyinstaller: `./scripts/build-installer`

Run the executable on test data: `./scripts/test-run-exe`
