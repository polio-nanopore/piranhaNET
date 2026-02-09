import os

#print("RUNTIME HOOK")
# TODO: can i get running context from pytinstaller hooks support, or just use core python ?
os.environ["PATH"] += os.pathsep + '/home/emmarussell/dev/piranhaNET/piranha-installer/dist/piranha/_internal/piranha_dependencies'
print(os.environ["PATH"])