import asyncio
from uuid import uuid4
from datetime import datetime
from typing import Annotated, AsyncGenerator
from fastapi import FastAPI, UploadFile, Depends
from fastapi.responses import StreamingResponse

app = FastAPI()

def generate_run_id() -> str:
  # TODO: use utc?
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
    yield "{} Starting fake Piranha process\n".format(run_id)
    await asyncio.sleep(2)
    yield "{} Fake Piranha update 1\n".format(run_id)
    await asyncio.sleep(2)
    yield "{} Fake Piranha update 2\n".format(run_id)
    await asyncio.sleep(2)
    yield "{} Barcodes filename is {}\n".format(run_id, barcodes_file.filename)
    yield "{} MinKnow zipname is {}\n".format(run_id, minknow_zip.filename)
    yield "{} Fake Piranha completed\n".format(run_id)

# TODO: how to be pythonic and jsonic with parameter names..?
@app.post("/run")
async def run(run_name: str, barcodes_file: UploadFile, minknow_zip: UploadFile, run_id: Annotated[str, Depends(generate_run_id)]):
    # TODO: Make this Depends on FileManager
    # NB The type of UploadFile is SpooledTemporaryFile
    return StreamingResponse(
      fake_log_generator(run_name, barcodes_file, minknow_zip, run_id),
      media_type="text/plain"
    )

