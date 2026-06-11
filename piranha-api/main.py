from uuid import uuid4
from datetime import datetime
from fastapi import FastAPI, UploadFile, Depends

app = FastAPI()

def generate_run_id():
  now = datetime.now()
  return "{year}-{month}-{day}_{hour}-{minute}-{second}_{uuid}".format(
    year=now.strftime("%Y"), month=now.strftime("%m"), day=now.strftime("%d"),
    hour=now.strftime("%H"), minuts=now.strftime("%M"), second=now.strftime("%S"),
    uuid4().hex
  )


@app.get("/")
def read_root():
    return "Welcome to PiranhaNET API"

@app.post("/run")
async def run(run_name: string, barcodes_file: UploadFile, minknow_zip: UploadFile, run_id: Depends(generate_run_id):
    # TODO: Make this Depends on FileManager, and generate_run_id
    # NB The type of UploadFile is SpooledTemporaryFile
    return {
        "runId": run_id
        "barcodesFileName": barcodes_file.filename,
        "minKnowZipName": minknow_zip.filename
    }