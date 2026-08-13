!include "LogicLib.nsh"

; Only bundle the docker image if we're building the full installer
!if "$%BUNDLE_PIRANHA_IMAGE%" == "true"
  Section "Piranha Image"
    SetOutPath "$INSTDIR\resources"
    File "${PROJECT_DIR}\installer-resources\piranha-docker-image.tar"

    ; Check if Docker is installed - TODO check for more appropriate message box. Check if error if DD not running.
    ExecWait 'docker --version' $0
    ${If} $0 != 0
      MessageBox MB_OK "Docker is not installed. Please install Docker Desktop for Windows first."
      Abort
    ${EndIf}

    ExecWait 'docker load -i "$INSTDIR\resources\piranha-docker-image.tar"' $0
    ${If} $0 != 0
      MessageBox MB_ICONEXCLAMATION "Failed to load Piranha image."
    ${EndIf}
  SectionEnd
!endif
