import asyncio
import os
import subprocess
from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, FastAPI, UploadFile, BackgroundTasks
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
def read_root():
    return "Welcome to PiranhaNET API"


async def fake_log_generator(
    run_name: str, barcodes_file: UploadFile, minknow_zip: UploadFile, run_id: str
) -> AsyncGenerator[str, None]:
    print(f"{run_id} Starting run {run_name}")
    yield f"{run_id} Starting fake Piranha process for {run_name}"
    yield f"{run_id} Barcodes filename is {barcodes_file.filename}"
    yield f"{run_id} MinKnow zipname is {minknow_zip.filename}"
    # Fake the long-running Piranha process by doing some sleeps
    await asyncio.sleep(2)
    yield f"{run_id} Fake Piranha update 1"
    await asyncio.sleep(2)
    yield f"{run_id} Fake Piranha update 2"
    await asyncio.sleep(2)
    yield f"{run_id} Saving output files"
    file_manager.save_output(run_id)
    yield f"{run_id} Fake Piranha completed"
    print(f"{run_id} Finished run")

PIRANHA_ENV_PATH = "/venv/bin"
PIRANHA_BINARY = os.path.join(PIRANHA_ENV_PATH, "piranha")

def run_piranha_pipeline(input_dir: str, output_dir: str):
    custom_env = os.environ.copy()
    custom_env["PATH"] = f"{PIRANHA_ENV_PATH}:{custom_env['PATH']}"
    cmd = [PIRANHA_BINARY, "-i", input_dir, "-o", output_dir]
    subprocess.run(cmd, env=custom_env, check=True)


# TODO: use a pydantic model for the run parameters when we're using full Piranha parameter set
@app.post("/run")
async def run(
    run_name: str, barcodes_file: UploadFile, minknow_zip: UploadFile, run_id: Annotated[str, Depends(generate_run_id)], background_tasks: BackgroundTasks
):
    # Save input files before start response so we can raise any errors related to bad file input before we start
    # streaming output
    await file_manager.save_input(run_id, barcodes_file, minknow_zip)
    background_tasks.add_task(run_piranha_pipeline, file_manager.input_dir(run_id), file_manager.output_dir(run_id))
    return StreamingResponse(
        fake_log_generator(run_name, barcodes_file, minknow_zip, run_id),
        headers={"piranhanet-run-id": run_id},  # Return the run id in header, as response body is streamed log
        media_type="text/plain",
    )


@app.get("/results/{run_id}")
def results(run_id: str, response_class=HTMLResponse):  # noqa: ARG001  Allow apparently unused response_class param
    return file_manager.read_output_report(run_id)
