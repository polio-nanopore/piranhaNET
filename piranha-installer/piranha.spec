# -*- mode: python ; coding: utf-8 -*-

from conda.core.envs_manager import list_all_known_prefixes

# Get the root of the installed piranha package in order to copy data files etc into the installer
# TODO: replace this with pulp pattern
env_root = list(filter(lambda prefix: prefix.endswith("piranha-installer"), list_all_known_prefixes()))[-1]
python_version = "3.9"
piranha_package_root = "{env_root}/lib/python{python_version}/site-packages/piranha/".format(env_root = env_root, python_version = python_version)

def get_pulp_path():
    import pulp
    return pulp.__path__[0]

a = Analysis(
    ['entrypoint.py'],
    pathex=[],
    binaries=[],
    datas=[
     (piranha_package_root + 'scripts', './piranha/scripts'),
     (piranha_package_root + 'analysis', './piranha/analysis'),
     (piranha_package_root + 'data', './piranha/data')

    ],
    hiddenimports=[
      'pulp',
      'minimap2',
      'snakemake',
      'medaka'
    ],
    hookspath=['/home/emmarussell/dev/piranhaNET/piranha-installer/hooks'],
    hooksconfig={},
    runtime_hooks=['runtime_hook.py'],
    excludes=[],
    noarchive=False,
    optimize=0,
)

# TODO: check if we actually need to do this?
a.datas += Tree(get_pulp_path(), prefix='pulp', excludes=["*.pyc"])

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='piranha',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='piranha',
)
