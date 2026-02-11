import subprocess
import sys
from piranha import command
import runpy

name, *args = sys.argv

# Decide from args whether this is the top level entrypoint to a
# piranha run, or an invocation of snakemake.
# (This is needed because snakemake uses sys.executable to launch
# new workflows, expecting the exe to be python or python3, but that
# is not the case when running from this executable!)
if (args[0] == "-m" and args[1] == "snakemake"):
    # Run snakemake with remaining args
    sys.argv = [name, *args[2:]]
    runpy.run_module("snakemake")
else:
    # Run piranha
    command.main(args)