!include "LogicLib.nsh"

; Only bundle the docker image if we're building the full installer
!if "$%BUNDLE_PIRANHA_IMAGE%" == "true"
  Section "Piranha Image"
    SetOutPath "$INSTDIR\resources"
    File "${PROJECT_DIR}\installer-resources\piranha-docker-image.tar"

    ; Check if Docker Desktop is installed and running by checking if docker info can run
    ExecWait 'cmd.exe /c docker info' $0
    ${If} $0 != 0
      MessageBox MB_OK "Docker is not installed or running. Please install and run Docker Desktop for Windows."
      Abort
    ${EndIf}

    ; Load image - save log which may be useful for debug if any issues
    DetailPrint "Loading Docker image. This may take several minutes..."
    ExecWait 'cmd.exe /c docker load -i "$INSTDIR\resources\piranha-docker-image.tar" > "$INSTDIR\docker-load.log" 2>&1' $0
    ${If} $0 != 0
      MessageBox MB_ICONEXCLAMATION "Failed to load Piranha image. PiranhaNET will attempt to pull image on first run."
    ${EndIf}
  SectionEnd
!endif
