import os
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, UploadFile
from fastapi.responses import HTMLResponse, StreamingResponse
from shortuuid import uuid

from app.file_manager import FileManager
from app.piranha_runner import PiranhaRunner
from app.settings import settings

app = FastAPI()
file_manager = FileManager(Path(settings.input_dir), Path(settings.output_dir))

piranha_runner = PiranhaRunner(Path(settings.piranha_venv_path))


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


# TODO: use a pydantic model for the run parameters when we're using full Piranha parameter set
@app.post("/run")
async def run(
    run_name: str, barcodes_file: UploadFile, minknow_zip: UploadFile, run_id: Annotated[str, Depends(generate_run_id)]
):
    # Save input files before start response so we can raise any errors related to bad file input before we start
    # streaming output
    await file_manager.save_input(run_id, barcodes_file, minknow_zip)
    minknow_dir_path = file_manager.minknow_dir(run_id)
    barcodes_file_path = os.path.join(file_manager.input_dir(run_id), barcodes_file.filename)
    output_dir_path = file_manager.make_output_dir(run_id)
    return StreamingResponse(
        piranha_runner.run_piranha_log_generator(
            run_id, run_name, barcodes_file_path, minknow_dir_path, output_dir_path
        ),
        headers={"piranhanet-run-id": run_id},  # Return the run id in header, as response body is streamed log
        media_type="text/plain",
    )


@app.get("/results/{run_id}")
def results(run_id: str, response_class=HTMLResponse):  # noqa: ARG001  Allow apparently unused response_class param
    return file_manager.read_output_report(run_id)
