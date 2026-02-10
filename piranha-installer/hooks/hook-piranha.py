from PyInstaller import log as logging
from PyInstaller.utils.hooks import collect_dynamic_libs, collect_submodules

logger = logging.getLogger(__name__)
logger.warning("DOING PIRANHA HOOK")

# !/home/emmarussell/dev/piranhaNET/piranha-installer/dist/piranha/_internal/piranha_dependencies/python

# TODO: consider exclude tkinter from spec rather than hacky override
# TODO: use conda_support for source folder - or get_path as used in get_pulp_path
# TODO: get these dependencies from piranha's DEPENDENCIES list
# TODO; All the shebang python scripts will have to be changed to the right python path!! Or can we use  #!/usr/bin/env

sm_hiddenimports = collect_submodules("snakemake")
#med_hiddenimports = collect_submodules("medaka") # didn't work...


hiddenimports = sm_hiddenimports
print(str(hiddenimports))

binaries = [
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/medaka*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/minimap2*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/snakemake*', 'piranha_dependencies'),
  # NB cbc not in deps list but required solver for snakemake via pulp
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/cbc*', 'piranha_dependencies'),
  # Python itself needs to be callable, from medaka_haploid_variant
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/python*', 'piranha_dependencies')
]



