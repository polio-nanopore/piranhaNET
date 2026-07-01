import asyncio
import aiofiles
import os
import subprocess
from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, UploadFile
from fastapi.responses import HTMLResponse, StreamingResponse
from shortuuid import uuid

from app.file_manager import FileManager
from app.settings import settings

app = FastAPI()
file_manager = FileManager(settings.input_dir, settings.output_dir)


def get_piranha_env():
    """Get the environment with /venv activated"""
    # Source /venv and capture all environment variables
    print("calling get_piranha_env")
    result = subprocess.run(["/bin/bash", "-c", "source /venv/bin/activate && env"], capture_output=True, text=True)
    print("called subproc")
    print("result is")
    print(result)
    # Parse the env output into a dict
    env_dict = {}
    for line in result.stdout.split("\n"):
        if "=" in line:
            key, value = line.split("=", 1)
            env_dict[key] = value
    return env_dict


piranha_env = get_piranha_env()


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
    start_line = f"Starting run {run_name} with run id {run_id}"
    yield start_line
    print(start_line)

    # TODO: revert notempt and verbose
    # piranha_cmd = f"source /venv/bin/activate && piranha -b {barcodes_file_path} -i {minknow_dir_path} -o {output_dir_path} -t 10 --verbose --no-temp"
    # TODO: Is /tmp best place for logfiles? Could put it in requests_data/output, and then they'd be saved if ever needed. Actually,
    # let's write this to output and include it in the download zip!

    # We need to write to a log file because mafft (called fron piranha) assumes that the default stdout is available, and errors if it's being piped through the
    # subprocess. So we do not set stdout or stderr on the process, but instead send all output to a log file which we poll and stream
    # to the response. This has a nice consequence that we're naturally saving the logs to file, which we can include in the download
    # zip of the run - it may be useful.
    log_path = Path(f"/tmp/subprocess_{run_id}.log")
    piranha_cmd = f"source /venv/bin/activate && piranha -b {barcodes_file_path} -i {minknow_dir_path} -o {output_dir_path} -t 10 --verbose --no-temp > {log_path} 2>&1"
    # cmd = ["/bin/bash", "-lc", piranha_cmd]
    # bash_wrap_cmd = f"bash -i -c '{piranha_cmd}'"

    print("command is")
    print(piranha_cmd)
    try:
        # start non-blocking process
        # process = await asyncio.create_subprocess_exec(
        process = await asyncio.create_subprocess_shell(piranha_cmd, env=piranha_env, executable="/bin/bash")

        # Wait for the log file to be created
        POLL_WAIT = 0.2
        remaining_wait = 5
        while not log_path.exists() and remaining_wait > 0:
            await asyncio.sleep(POLL_WAIT)
            remaining_wait -= POLL_WAIT

        # While process is running, poll logfile for new content
        async with aiofiles.open(log_path, "r") as f:
            while process.returncode is None:
                new_content = await f.read()
                if new_content:
                    yield new_content
                    print(new_content)  # TODO: util to print and yield with run_id
                await asyncio.sleep(POLL_WAIT)

            # Read any remaining content after process finishes
            await process.wait()
            remaining_content = await f.read()
            if remaining_content:
                yield remaining_content
                print(remaining_content)

        # Final status message
        final_msg = f"Piranha run completed with exit code {process.returncode}\n"
        yield final_msg
        print(final_msg)

    except Exception as e:
        # TODO: how should we return error status in the case of piranha run error? Request has already gone at this point...
        # Error if don't have expected final line? Or make /status endpoint available?
        yield f"\n[ERROR] Exception encountered during execution: {str(e)}\n"

    final_line = f"{run_id} Finished run"
    yield final_line
    print(final_line)


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
        piranha_run_log_generator(run_id, run_name, barcodes_file_path, minknow_dir_path, output_dir_path),
        headers={"piranhanet-run-id": run_id},  # Return the run id in header, as response body is streamed log
        media_type="text/plain",
    )


@app.get("/results/{run_id}")
def results(run_id: str, response_class=HTMLResponse):  # noqa: ARG001  Allow apparently unused response_class param
    return file_manager.read_output_report(run_id)
