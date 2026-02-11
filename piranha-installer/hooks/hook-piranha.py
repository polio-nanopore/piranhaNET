from PyInstaller import log as logging
from PyInstaller.utils.hooks import collect_dynamic_libs, collect_submodules, conda_support

logger = logging.getLogger(__name__)
logger.warning("DOING PIRANHA HOOK")

# Use this shebang in arbitary scripts called via snakemake
# !/home/emmarussell/dev/piranhaNET/piranha-installer/dist/piranha/_internal/piranha_dependencies/python

# TODO: consider exclude tkinter from spec rather than hacky override
# TODO: use conda_support for source folder - or get_path as used in get_pulp_path
# TODO: get dependencies from piranha's DEPENDENCIES list (medaka, minimap2, snakemake)
# TODO; All the shebang python scripts will have to be changed to the right python path - it *should* be relative to the
# script itself to pick up the right python binary, bit how to do that? These are the medaka_ scripts in piranha_dependencies - any others??
# TODO: revisit deps in environment yml
# TODO: add lint

sm_hiddenimports = collect_submodules("snakemake")

hiddenimports = sm_hiddenimports
print(str(hiddenimports))

binaries = [
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/medaka*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/minimap2*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/snakemake*', 'piranha_dependencies'),
  # NB cbc not in deps list but required solver for snakemake via pulp
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/cbc*', 'piranha_dependencies'),
  # Python itself needs to be callable, from medaka_haploid_variant
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/python*', 'piranha_dependencies'),
  # dependencies used from snakemake
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/bcftools*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/bgzip*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/samtools*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/tabix*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/mini_align*', 'piranha_dependencies'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/bin/mafft*', 'piranha_dependencies'),
  # required from lib (by samtools)
  ('/home/emmarussell/micromamba/envs/piranha-installer/lib/libhts*', '.'),
  ('/home/emmarussell/micromamba/envs/piranha-installer/lib/libgsl*', '.'),
]

#medaka_deps = conda_support.walk_dependency_tree("medaka")
#snakemake_deps = conda_support.walk_dependency_tree("snakemake")
#minimap2_deps = conda_support.walk_dependency_tree("minimap2")
#print(str(medaka_deps))



