import os
from datetime import UTC, datetime
from pathlib import Path
from shutil import rmtree
from typing import Annotated

from fastapi import BackgroundTasks, Depends, FastAPI, File, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from shortuuid import uuid

from app.file_manager import FileManager
from app.models import PiranhaRunOptions
from app.piranha_runner import PiranhaRunner
from app.settings import settings

app = FastAPI()
file_manager = FileManager(Path(settings.input_dir), Path(settings.output_dir))

piranha_runner = PiranhaRunner(Path(settings.piranha_venv_path))

# TODO: make allowed origins configurable to only allow PiranhaNET front end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["piranhanet-run-id", "Content-Disposition"] # TODO: make this a const
)

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


@app.post("/run")
async def run(
    run_options: Annotated[PiranhaRunOptions, Depends()],
    barcodes_file: Annotated[UploadFile, File(alias="barcodesFile")],
    minknow_zip: Annotated[UploadFile, File(alias="minknowZip")],
    run_id: Annotated[str, Depends(generate_run_id)],
):
    # Save input files before start response so we can raise any errors related to bad file input before we start
    # streaming output
    await file_manager.save_input(run_id, barcodes_file, minknow_zip)
    minknow_dir_path = file_manager.minknow_dir(run_id)
    barcodes_file_path = os.path.join(file_manager.input_dir(run_id), barcodes_file.filename)
    output_dir_path = file_manager.make_output_dir(run_id)
    return StreamingResponse(
        piranha_runner.run_piranha_log_generator(
            run_id, run_options, str(barcodes_file_path), str(minknow_dir_path), str(output_dir_path)
        ),
        headers={"piranhanet-run-id": run_id},  # Return the run id in header, as response body is streamed log
        media_type="text/plain",
    )


@app.get("/results/{run_id}")
def results(run_id: str, background_tasks: BackgroundTasks, response_class=FileResponse):  # noqa: ARG001  Allow apparently unused response_class param
    (zip_path, tmp_dir) = file_manager.read_output_zip(run_id)

    # Schedule cleanup of local archive for after response completes
    background_tasks.add_task(rmtree, tmp_dir)

    return FileResponse(path=zip_path, filename=f"{run_id}.zip", media_type="application/zip")
