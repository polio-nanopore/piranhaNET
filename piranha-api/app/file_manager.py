from pathlib import Path
from shutil import make_archive
from zipfile import BadZipFile, ZipFile
from tempfile import mkdtemp

from fastapi import HTTPException, UploadFile


class FileManager:
    def __init__(self, input_root: Path, output_root: Path):
        self.input_root = input_root
        self.output_root = output_root

    def input_dir(self, run_id: str):
        return self.input_root / run_id

    def minknow_dir(self, run_id: str):
        return self.input_dir(run_id) / "minknow"

    def output_dir(self, run_id: str):
        return self.output_root / run_id

    def bad_request(self, run_id: str, msg: str):
        detail = f"Bad request for run {run_id}: {msg}"
        print(detail)
        raise HTTPException(status_code=400, detail=detail) from None

    async def save_input(self, run_id: str, barcodes_file: UploadFile, minknow_zip: UploadFile):
        # Create minknow folder
        minknow_dir = self.minknow_dir(run_id)
        minknow_dir.mkdir(parents=True)
        # Unzip minknow to minknow folder
        try:
            with ZipFile(minknow_zip.file) as zip_file:
                zip_file.extractall(minknow_dir)
        except BadZipFile:
            raise HTTPException(status_code=400, detail="Invalid zip file.") from None
        finally:
            await minknow_zip.close()

        # Save barcodes file
        run_dir = self.input_dir(run_id)
        barcodes_file_path = run_dir / barcodes_file.filename
        with barcodes_file_path.open(mode="wb") as saved_barcodes_file:
            barcodes_content = await barcodes_file.read()
            saved_barcodes_file.write(barcodes_content)

    def make_output_dir(self, run_id):
        output_dir = self.output_dir(run_id)
        output_dir.mkdir(parents=True)
        return output_dir

    def read_output_zip(self, run_id: str, background_tasks: BackgroundTasks):
        input_dir = self.input_dir(run_id)
        if not input_dir.exists():
            self.bad_request(run_id, "Run ID not found.")
        output_dir = self.output_dir(run_id)

       # Make a temp dir for the zip
       tmp_dir = mkdtemp()
       zip_path = make_archive(
           base_name=f"{tmp_dir}/{run_id}",
           format="zip",
           root_dir=output_dir.parent,
           base_dir=output_dir.name
       )
       return (zip_path, tmp_dir)
