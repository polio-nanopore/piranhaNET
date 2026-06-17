import asyncio
from uuid import uuid4
from datetime import datetime
from typing import Annotated, AsyncGenerator
from fastapi import FastAPI, UploadFile, Depends
from fastapi.responses import StreamingResponse, HTMLResponse
from app.settings import settings
from app.file_manager import FileManager

app = FastAPI()
file_manager = FileManager(settings.input_dir, settings.output_dir)

def generate_run_id() -> str:
  # TODO: use utc?
  # TODO: uid bbit could be shorter!
  now = datetime.now()
  return "{year}-{month}-{day}_{hour}-{minute}-{second}_{uuid}".format(
    year=now.strftime("%Y"), month=now.strftime("%m"), day=now.strftime("%d"),
    hour=now.strftime("%H"), minute=now.strftime("%M"), second=now.strftime("%S"),
    uuid=uuid4().hex
  )

@app.get("/")
def read_root():
    return "Welcome to PiranhaNET API"

async def fake_log_generator(run_name: str, barcodes_file: UploadFile, minknow_zip: UploadFile, run_id: str) -> AsyncGenerator[str, None] :
    # TODO: use f"" formatting
    yield "{} Starting fake Piranha process".format(run_id)
    yield "{} Barcodes filename is {}".format(run_id, barcodes_file.filename)
    yield "{} MinKnow zipname is {}".format(run_id, minknow_zip.filename)
    yield f"{run_id} Saving input files"
    await file_manager.save_input(run_id, barcodes_file, minknow_zip)
    # Fake the long-running Piranha process by doing some sleeps
    await asyncio.sleep(2)
    yield "{} Fake Piranha update 1".format(run_id)
    await asyncio.sleep(2)
    yield "{} Fake Piranha update 2".format(run_id)
    await asyncio.sleep(2)
    yield f"{run_id} Saving output files"
    file_manager.save_output(run_id)
    yield "{} Fake Piranha completed".format(run_id)

# TODO: how to be pythonic and jsonic with parameter names..?
@app.post("/run")
async def run(
  run_name: str,
  barcodes_file: UploadFile,
  minknow_zip: UploadFile,
  run_id: Annotated[str, Depends(generate_run_id)]):
    return StreamingResponse(
      fake_log_generator(run_name, barcodes_file, minknow_zip, run_id),
      headers={"piranhanet-run-id": run_id}, # Return the run id in header, as response body is streamed log
      media_type="text/plain"
    )

# TODO: error handling
@app.get("/results/{run_id}")
def results(run_id: str, response_class = HTMLResponse):
    return file_manager.read_output_report(run_id)


