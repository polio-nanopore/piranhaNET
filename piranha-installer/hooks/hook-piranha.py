from PyInstaller import log as logging
from PyInstaller.utils.hooks import collect_dynamic_libs, collect_submodules

logger = logging.getLogger(__name__)
logger.warning("DOING PIRANHA HOOK")

# TODO: consider exclude tkinter from spec rather than hacky override
# TODO: use conda_support for source folder - or get_path as used in get_pulp_path
# TODO: get these dependencies from piranha's DEPENDENCIES list

#sm_hiddenimports = collect_submodules("snakemake")
#print(str(sm_hiddenimports))

hiddenimports = sm_hiddenimports

binaries = [
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/medaka*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/minimap2*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/snakemake*', 'piranha_dependencies'),
  # NB cbc not in deps list but required solver for snakemake via pulp
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/cbc*', 'piranha_dependencies')
]



