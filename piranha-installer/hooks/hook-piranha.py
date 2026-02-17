import os
import shutil
import sys
from PyInstaller import log as logging
from PyInstaller.utils.hooks import collect_dynamic_libs, collect_submodules, conda_support, collect_entry_point, collect_data_files

logger = logging.getLogger(__name__)
logger.info("Running piranha hook")

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
dependencies_dest = "bin"

scripts_to_port = []
def make_portable(file_path):
    # Some of the files we need to collect are python scripts pulled from conda with local conda environment shebangs
    # - identify these using the current sys prefix to identify the conda root.  We'll need to port these to the
    # runtime environment on first startup, so here we make a note of which files these are

    # Read in the file
    try:
        with open(file_path, "r") as f:
            contents = f.read()
    except UnicodeDecodeError:
        # not a text file
        return file_path

    # Check if the first line includes #![sys.prefix]/bin/python
    first_line, *following_lines = contents.split("\n")
    local_shebang = f"#!{sys.prefix}/bin/python"
    print("LOCAL SHEBANG")
    print(local_shebang)
    print("FIRST LINE")
    print(first_line)
    if local_shebang in first_line:
        print("FOUND NONPORTABLE FILE")
        file_name = os.path.basename(file_path)
        if file_name not in scripts_to_port:
            scripts_to_port.append(file_name)

        # If so, replace it with !#/usr/bin/env python. This will preserve any python version after 'python'.
        #new_first_line = first_line.replace(local_shebang, "!#/usr/bin/env python")
        #file_name = os.path.basename(file_path)
        # ...and save to portable_scripts folder
        #new_file_path = os.path.join(portable_folder, file_name)
        #with open(new_file_path, "w") as f:
        #    f.write("\n".join([new_first_line, *following_lines]))
        #os.chmod(new_file_path, 0o755) # make executable by all

    return file_path

def collect_bin_files_from_package(package_name):
    return [(make_portable(file.locate()), dependencies_dest) for file in conda_support.files(package_name) if file.parts[0] == "bin"]

def collect_lib_files_from_package(package_name):
    return [(file.locate(), ".") for file in conda_support.files(package_name) if file.parts[0] == "lib"]

def collect_bin_file(filename):
    return (make_portable(os.path.join(conda_bin, filename)), dependencies_dest)

binaries = [
  *collect_bin_files_from_package("medaka"),
  *collect_bin_files_from_package("minimap2"),
  collect_bin_file("snakemake"),
  # required solver for snakemake via pulp
  collect_bin_file("cbc"),
  # Python itself needs to be runnable, from medaka_haploid_variant
  *collect_bin_files_from_package("python"),
  # dependencies used from snakemake
  *collect_bin_files_from_package("bcftools"),
  *collect_bin_files_from_package("htslib"), # collects bgzip and tabix
  collect_bin_file("samtools"),
  *collect_bin_files_from_package("mafft"),
  # required by samtools
  *collect_lib_files_from_package("htslib"),
  *collect_lib_files_from_package("gsl"),
]

# TODO: remove
print("sys prefix")
print(sys.prefix)

ported_scripts_file = "ported_scripts"
with open(ported_scripts_file, "w") as f:
    f.write("\n".join(scripts_to_port))
os.chmod(ported_scripts_file, 0o744) # make readable by all

datas = [
    *collect_data_files("piranha", include_py_files=False, subdir='data'),
    *collect_data_files("piranha", include_py_files=True, subdir='analysis'),
    *collect_data_files("piranha", include_py_files=True, subdir='scripts'),
    (ported_scripts_file, dependencies_dest)
]

# TODO: comment
module_collection_mode = {
    "medaka": "py",
    "python3.9": "py"
}



