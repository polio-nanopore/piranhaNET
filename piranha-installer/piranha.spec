# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['entrypoint.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[
      'pulp',
      'minimap2',
      'snakemake',
      'medaka'
    ],
    hookspath=['hooks'],
    hooksconfig={},
    runtime_hooks=['runtime_hook.py'],
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
    upx=False,
    upx_exclude=[],
    name='piranha',
)
