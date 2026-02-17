import os

print("RUNTIME HOOK")
# TODO: comment
installer_path = os.path.dirname(__file__)
bin_path = os.path.join(installer_path, "bin")

# TODO: comment
#print("BIN PATH: " + bin_path)
#print("PATH: " + os.environ["PATH"])
#if bin_path not in os.environ["PATH"]:
#   os.environ["PATH"] += os.pathsep + bin_path
#   print("NEW PATH: " + os.environ["PATH"])

# TODO: Maybe not necessary when set shebang in python shell scripts correctly
existing_pythonpath = os.environ["PYTHONPATH"] if "PYTHONPATH" in os.environ else ''
if installer_path not in existing_pythonpath:
    os.environ["PYTHONPATH"] = existing_pythonpath + os.pathsep + installer_path if existing_pythonpath else installer_path
os.environ["PYTHONHOME"] = os.path.join(installer_path, "python3.9")

# Check if run_dir exists, and if its contents are the same as current dir - if so, we don't need to port the scripts
run_dir_file = os.path.join(bin_path, "piranha_run_dir")
prev_run_dir = None
if (os.path.exists(run_dir_file)):
    with open(run_dir_file, "r") as f:
        prev_run_dir = f.read()

if prev_run_dir != installer_path:
    print("porting scripts")
    ported_scripts_file = os.path.join(bin_path, "ported_scripts")
    # get the names of the files we need to port
    with open(ported_scripts_file, "r") as f:
        scripts_to_port = f.read().split("\n")
    print(str(scripts_to_port))

    # update the files with local python path
    new_shebang = f"#!{os.path.join(bin_path,'python3')}"
    for script in scripts_to_port:
        script_path = os.path.join(bin_path, script)
        with open(script_path, "r") as f:
            contents = f.read()
        first_line, *following_lines = contents.split("\n")
        with open(script_path, "w") as f:
            f.write("\n".join([new_shebang, *following_lines]))

    # write out the run_dir so we don't need to do this next time, unless we get moved
    with open(run_dir_file, "w") as f:
        f.write(installer_path)

print("FINISHED RUNTIME HOOK")