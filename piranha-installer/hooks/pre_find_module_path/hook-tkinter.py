from PyInstaller.utils.hooks import tcl_tk
from PyInstaller import log as logging
logger = logging.getLogger(__name__)

class FakeInfo(object):
    available = True

def pre_find_module_path(hook_api):
    logger.warning("OVERRIDING UNSUPPORTED TKINTER HOOK")
    # Avoid the built in pre find module hook killing the installer by setting the tcltk_info property
    tcl_tk.tcltk_info = FakeInfo()
#    if not tcl_tk.tcltk_info.available:
#        logger.warning("tkinter installation is broken. It will be excluded from the application")
#        hook_api.search_dirs = []
