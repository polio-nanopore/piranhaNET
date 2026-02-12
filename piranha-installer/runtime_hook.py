import os

print("RUNTIME HOOK")
# TODO: comment
installer_path = os.path.dirname(__file__)
# TODO: replace piranha_dependencies with bin
bin_path = os.path.join(installer_path, "piranha_dependencies")

# TODO: comment
if bin_path not in os.environ["PATH"]:
   os.environ["PATH"] += os.pathsep + bin_path

existing_pythonpath = os.environ["PYTHONPATH"] if "PYTHONPATH" in os.environ else ''
if installer_path not in existing_pythonpath:
    os.environ["PYTHONPATH"] = existing_pythonpath + os.pathsep + installer_path if existing_pythonpath else installer_path
