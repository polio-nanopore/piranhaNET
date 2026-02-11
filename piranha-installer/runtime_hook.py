import os

print("RUNTIME HOOK")
# TODO: can i get running context from pytinstaller hooks support, or just use core python ? Tidy up on teardown?
# TODO: don't add if already in path
os.environ["PATH"] += os.pathsep + '/home/emmarussell/dev/piranhaNET/piranha-installer/dist/piranha/_internal/piranha_dependencies'
if "PYTHONPATH" in os.environ:
    os.environ["PYTHONPATH"] +=os.pathsep + '/home/emmarussell/dev/piranhaNET/piranha-installer/dist/piranha/_internal'
else:
    os.environ["PYTHONPATH"] = '/home/emmarussell/dev/piranhaNET/piranha-installer/dist/piranha/_internal'