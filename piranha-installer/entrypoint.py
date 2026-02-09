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
    # Run snakemake
    # I think the problem is that when we try to relaunch snakemake here via python3, we lose all the bundled modules
    # including snakemake itself..
    # Can't we just run snakemake? we're already in a new process! - tried that before and it doesn't likt ie
    #subprocess.run(
    #  ["python3", *args],
    #  stdout=sys.stdout,
    #  stderr=sys.stdout,
    #  check=True,
    # )
    #print(str(args))
    #main(args[2:])
    #print("TRYING TO CALL SNAKEMAKE")
    #sys.argv = sys.argv[3:] # slice off name, '-m' and 'snakemake'
    sys.argv = [name, *args[2:]]
    #print(str(sys.argv))
    runpy.run_module("snakemake")
else:
    # Run piranha
    command.main(args)