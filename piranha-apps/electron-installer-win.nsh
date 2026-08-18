!include "LogicLib.nsh"

!define PIRANHA_DOCKER_IMAGE "polionanopore/piranha"
!defing DOCKER_UNZIPPING_MSG "Unzipping Piranha Docker image. This may take several minutes"
!define DOCKER_LOADING_MSG "Loading Piranha Docker image. This may take several minutes..."
!define DOCKER_FALLBACK_MSG "PiranhaNET will attempt to pull image on first run."
!define PIRANHA_VERSION "$%PIRANHA_VERSION%"

; Only bundle the docker image if we're building the full installer
!if "$%BUNDLE_PIRANHA_IMAGE%" == "true"
  Section "Piranha Image"
    SetOutPath "$INSTDIR\resources"
    File "${PROJECT_DIR}\installer-resources\piranha-docker-image.tar.gz"

    ; Check if Docker Desktop is installed and running by checking if docker info can run
    DetailPrint "Checking that Docker is available."
    ExecWait 'cmd.exe /c docker info' $0
    ${If} $0 != 0
      MessageBox MB_ICONSTOP "Docker is not installed or not running. Please install and run Docker Desktop for Windows before installing PiranhaNET."
      Abort
    ${EndIf}

    ; Check if we already have the required Piranha image version loaded in docker
    ExecWait 'docker image inspect ${PIRANHA_DOCKER_IMAGE}:${PIRANHA_VERSION}' $0

    ${If} $0 != 0
      ; Ungzip image
      DetailPrint "${DOCKER_UNZIPPING_MSG}"
      ; Retain the message during load
      SetDetailsPrint none
      ExecWait 'cmd.exe /c echo ${DOCKER_UNZIPPING_MSG} && tar xzf "$INSTDIR\resources\piranha-docker-image.tar.gz" -C "$INSTDIR\resources"' $0
      SetDetailsPrint both
      ${If} $0 != 0
        MessageBox MB_ICONEXCLAMATION "Failed to unzip Piranha image. $DOCKER_FALLBACK_MSG"
      ${EndIf}

      ; Load image
      DetailPrint "${DOCKER_LOADING_MSG}"
      ; Retain the message during load
      SetDetailsPrint none
      ExecWait 'cmd.exe /c echo ${DOCKER_LOADING_MSG} && docker load -i "$INSTDIR\resources\piranha-docker-image.tar"' $0
      SetDetailsPrint both
      ${If} $0 != 0
        MessageBox MB_ICONEXCLAMATION "Failed to load Piranha image. $DOCKER_FALLBACK_MSG"
      ${EndIf}
    ${EndIf}
    DetailPrint "Installing PiranhaNET..."
  SectionEnd
!endif
