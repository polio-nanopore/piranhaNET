# -*- mode: python ; coding: utf-8 -*-

from conda.core.envs_manager import list_all_known_prefixes

# Get the root of the installed piranha package in order to copy data files etc into the installer
env_root = list(filter(lambda prefix: prefix.endswith("piranha-installer"), list_all_known_prefixes()))[-1]
python_version = "3.9"
piranha_package_root = "{env_root}/lib/python{python_version}/site-packages/piranha/".format(env_root = env_root, python_version = python_version)

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
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)

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
    upx=True,
    upx_exclude=[],
    name='piranha',
)
