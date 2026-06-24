import asyncio
import os
import subprocess
from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, FastAPI, UploadFile
from fastapi.responses import HTMLResponse, StreamingResponse
from shortuuid import uuid

from app.file_manager import FileManager
from app.settings import settings

app = FastAPI()
file_manager = FileManager(settings.input_dir, settings.output_dir)


def generate_run_id() -> str:
    now = datetime.now(UTC)
    return "{year}-{month}-{day}_{hour}-{minute}-{second}_{uuid}".format(
        year=now.strftime("%Y"),
        month=now.strftime("%m"),
        day=now.strftime("%d"),
        hour=now.strftime("%H"),
        minute=now.strftime("%M"),
        second=now.strftime("%S"),
        uuid=uuid(),
    )


@app.get("/")
def get_root():
    return "Welcome to PiranhaNET API"


# TODO: add these to settings and set in Dockerfile
PIRANHA_ENV_PATH = "/venv/bin"
PIRANHA_BINARY = os.path.join(PIRANHA_ENV_PATH, "piranha")
# TODO: tidy some of this into another module
async def piranha_run_log_generator(
    run_id: str, run_name: str, barcodes_file_path: str, minknow_dir_path: str, output_dir_path: str
) -> AsyncGenerator[str, None]:
    print(f"Starting run {run_name} with run id {run_id}")

    piranha_env = os.environ.copy()
    piranha_env["PATH"] = f"{PIRANHA_ENV_PATH}:{piranha_env['PATH']}"
    cmd = [PIRANHA_BINARY, "-b", barcodes_file_path,  "-i", minknow_dir_path, "-o", output_dir_path]

    try:
      # start non-blocking process
      process = await asyncio.create_subprocess_exec(
          *cmd,
          stdout=asyncio.subprocess.PIPE,
          stderr=asyncio.subprocess.STDOUT,  # Merge stderr into stdout to catch errors
          env=piranha_env
      )
      if process.stdout is None:
          yield "Error: Failed to open standard output stream.\n"
          return

      while True:
          line = await process.stdout.readline()
          if not line:
              break
          decoded_line = line.decode("utf-8")
          yield decoded_line

      return_code = await process.wait()
      yield f"\n[INFO] Process finished with exit code: {return_code}\n"

    except Exception as e:
      # TODO: how should we return error status in the case of piranha run error? Request has already gone at this point...
      # Error if don't have expected final line? Or make /status endpoint available?
      yield f"\n[ERROR] Exception encountered during execution: {str(e)}\n"

    print(f"{run_id} Finished run")

# TODO: use a pydantic model for the run parameters when we're using full Piranha parameter set
@app.post("/run")
async def run(
    run_name: str, barcodes_file: UploadFile, minknow_zip: UploadFile, run_id: Annotated[str, Depends(generate_run_id)]):
    # Save input files before start response so we can raise any errors related to bad file input before we start
    # streaming output
    await file_manager.save_input(run_id, barcodes_file, minknow_zip)
    minknow_dir_path = file_manager.minknow_dir(run_id)
    barcodes_file_path = os.path.join(file_manager.input_dir(run_id), barcodes_file.filename)
    output_dir_path = file_manager.output_dir(run_id)
    return StreamingResponse(
        piranha_run_log_generator(run_id, run_name, barcodes_file_path, minknow_dir_path, output_dir_path),
        headers={"piranhanet-run-id": run_id},  # Return the run id in header, as response body is streamed log
        media_type="text/plain",
    )


@app.get("/results/{run_id}")
def results(run_id: str, response_class=HTMLResponse):  # noqa: ARG001  Allow apparently unused response_class param
    return file_manager.read_output_report(run_id)
