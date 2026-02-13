import os

# TODO: could we instead set these env vars in launches of subprocess env so as not to affect user env permanently
# See Launching External Programs from the Frozen Application at https://pyinstaller.org/en/stable/common-issues-and-pitfalls.html

print("RUNTIME HOOK")
# TODO: comment
installer_path = os.path.dirname(__file__)
bin_path = os.path.join(installer_path, "bin")

# TODO: comment
if bin_path not in os.environ["PATH"]:
   os.environ["PATH"] += os.pathsep + bin_path

# TODO: Maybe not necessary when set shebang in python shell scripts correctly
existing_pythonpath = os.environ["PYTHONPATH"] if "PYTHONPATH" in os.environ else ''
if installer_path not in existing_pythonpath:
    os.environ["PYTHONPATH"] = existing_pythonpath + os.pathsep + installer_path if existing_pythonpath else installer_path
