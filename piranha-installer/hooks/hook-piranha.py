import os
import sys
from PyInstaller import log as logging
from PyInstaller.utils.hooks import collect_dynamic_libs, collect_submodules, conda_support, collect_entry_point, collect_data_files

logger = logging.getLogger(__name__)
logger.info("Running piranha hook")

# Use this shebang in arbitary scripts called via snakemake
# !/home/emmarussell/dev/piranhaNET/piranha-installer/dist/piranha/_internal/piranha_dependencies/python

# TODO: pin piranha version
# TODO: consider exclude tkinter from spec rather than hacky override
# TODO: get dependencies from piranha's DEPENDENCIES list (medaka, minimap2, snakemake)
# TODO; All the shebang python scripts will have to be changed to the right python path - it *should* be relative to the
# script itself to pick up the right python binary, bit how to do that? These are the medaka_ scripts in piranha_dependencies - any others??
# TODO: revisit deps in environment yml
# TODO: add lint

sm_hiddenimports = collect_submodules("snakemake") # TODO: needed?

hiddenimports = sm_hiddenimports
print(str(hiddenimports))

conda_env_root = sys.prefix
conda_bin = os.path.join(conda_env_root, "bin")
conda_lib = os.path.join(conda_env_root, "lib")
# TODO: rename piranha_dependencies to bin
dependencies_dest = "piranha_dependencies"

def collect_bin_files_from_package(package_name):
    return [(file.locate(), dependencies_dest) for file in conda_support.files(package_name) if file.parts[0] == "bin"]

def collect_lib_files_from_package(package_name):
    return [(file.locate(), ".") for file in conda_support.files(package_name) if file.parts[0] == "lib"]


def collect_bin_file(filename):
    return (os.path.join(conda_bin, filename), dependencies_dest)

# TODO: or use add_binaries
binaries = [
  #('/home/emmarussell/micromamba/envs/piranha-installer/bin/medaka*', 'piranha_dependencies'),
  *collect_bin_files_from_package("medaka"),
  *collect_bin_files_from_package("minimap2"),
  #('/home/emmarussell/micromamba/envs/piranha-installer/bin/snakemake*', 'piranha_dependencies'),
  collect_bin_file("snakemake"),
  # NB cbc not in deps list but required solver for snakemake via pulp
  collect_bin_file("cbc"),
  # Python itself needs to be callable, from medaka_haploid_variant
  *collect_bin_files_from_package("python"),
  # dependencies used from snakemake
  *collect_bin_files_from_package("bcftools"),
  *collect_bin_files_from_package("htslib"), # collects bgzip and tabix
  #collect_bin_file("bgzip"),
  collect_bin_file("samtools"),
  #collect_bin_file("tabix"),
  *collect_bin_files_from_package("mafft"),
  # required from lib (by samtools)
  #('/home/emmarussell/micromamba/envs/piranha-installer/lib/libhts*', '.'),
  *collect_lib_files_from_package("htslib"),
  *collect_lib_files_from_package("gsl"),
]

test_collect = conda_support.files("gsl")
print("test collect")
print(str(test_collect))

#print("sys prefix")
#print(sys.prefix)

datas = [
    *collect_data_files("piranha", include_py_files=False, subdir='data'),
    *collect_data_files("piranha", include_py_files=True, subdir='analysis'),
    *collect_data_files("piranha", include_py_files=True, subdir='scripts')
]

#piranha_data_files = collect_data_files("piranha", include_py_files=False, subdir='data')
#print("DATA FILES")
#print(str(piranha_data_files))

#piranha_analysis_files = collect_data_files("piranha", include_py_files=True, subdir='analysis')
#print("ANALYSIS FILES")
#print(str(piranha_analysis_files))

#piranha_scripts_files = collect_data_files("piranha", include_py_files=True, subdir='scripts')
#print("SCRIPTS FILES")
#print(str(piranha_scripts_files))

