from io import BytesIO
from os import path, makedirs
from zipfile import ZipFile
from fastapi import UploadFile

class FileManager:
  def __init__(self, input_root, output_root):
    self.input_root = input_root
    self.output_root = output_root

  # TODO: unmagic the folder strings
  async def save_input(self, run_id: string, barcodes_file: UploadFile, minknow_zip: UploadFile):
    if not minknow_zip.filename.endswith(".zip"): # TODO: case insensitive
      raise HTTPException(status_code=400, detail="File must be a ZIP archive.")
    # Create minknow folder

    run_dir = path.join(self.input_root, run_id)
    minknow_dir = path.join(run_dir, "minknow")
    makedirs(minknow_dir)
    # Unzip minknow to minknow folder
    minknow_contents = minknow_zip.read()
    try:
      with ZipFile(minknow_zip.file) as zip_file: #
        zip_file.extractall(minknow_dir)
    except: zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP file.")
    finally:
        await minknow_zip.close()

    # Save barcodes file
    barcodes_file_path = path.join(run_dir, barcodes_file.filename)
    with open(barcodes_file_oath, "wb") as saved_barcodes_file:
        barcodes_content = await barcodes_file.read()
        saved_barcodes_file.write(barcodes_content)