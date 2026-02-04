import subprocess
import sys
from piranha import command

name, *args = sys.argv

# Decide from args whether this is the top level entrypoint to a
# piranha run, or an invocation of snakemake.
# (This is needed because snakemake uses sys.executable to launch
# new workflows, expecting the exe to be python or python3, but that
# is not the case when running from this executable!)
if (args[0] == "-m" and args[1] == "snakemake"):
    # Run snakemake
    subprocess.run(
      ["python3", *args],
      stdout=sys.stdout,
      stderr=sys.stdout,
      check=True,
   )
else:
    # Run piranha
    command.main(args)