from io import BytesIO
from os import path, makedirs
from zipfile import ZipFile, BadZipFile
from fastapi import UploadFile, HTTPException

REPORT_FILENAME = "report.html"

class FileManager:
  def __init__(self, input_root, output_root):
    self.input_root = input_root
    self.output_root = output_root

  def output_dir(self, run_id: str):
      return path.join(self.output_root, run_id)

  # TODO: unmagic the folder strings
  # TODO: what's the correct way to raise exception in the case of a streaming response?
  async def save_input(self, run_id: str, barcodes_file: UploadFile, minknow_zip: UploadFile):
    if not minknow_zip.filename.endswith(".zip"): # TODO: case insensitive, or test content type instead
      raise HTTPException(status_code=400, detail="File must be a ZIP archive.")
    # Create minknow folder

    run_dir = path.join(self.input_root, run_id)
    minknow_dir = path.join(run_dir, "minknow")
    print(f"Creating dir {minknow_dir}")
    makedirs(minknow_dir)
    # Unzip minknow to minknow folder
    minknow_contents = minknow_zip.read()
    try:
      with ZipFile(minknow_zip.file) as zip_file: #
        zip_file.extractall(minknow_dir)
    except BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP file.")
    finally:
        await minknow_zip.close()

    # Save barcodes file
    barcodes_file_path = path.join(run_dir, barcodes_file.filename)
    with open(barcodes_file_path, "wb") as saved_barcodes_file:
        barcodes_content = await barcodes_file.read()
        saved_barcodes_file.write(barcodes_content)

  def save_output(self, run_id: str):
      # Currently just write out a fake report.html and a csv file in a subfolder
      # These will be zipped for results download
      out_dir = self.output_dir(run_id)
      makedirs(out_dir)
      report_file_path = path.join(out_dir, REPORT_FILENAME)
      lines = [
        "<!doctype html>",
        "<html lang='en'>",
        "<head><meta charset='utf-8'><title>Fake Piranha report</title></head>",
        f"<body><h1>Fake Piranha report</h1><p>Report for run {run_id}</p></body>",
        "</html>"
      ]
      with open(report_file_path, "w") as report_file:
          report_file.writelines(lines)

  def read_output_report(self, run_id: str):
      report_file_path = path.join(self.output_dir(run_id), REPORT_FILENAME)
      with open(report_file_path, "r") as report_file:
          return report_file.read()