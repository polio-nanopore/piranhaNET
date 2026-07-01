from pathlib import Path
from zipfile import BadZipFile, ZipFile

from fastapi import HTTPException, UploadFile

REPORT_FILENAME = "report.html"


class FileManager:
    def __init__(self, input_root: Path, output_root: Path):
        self.input_root = input_root
        self.output_root = output_root

    def input_dir(self, run_id: str):
        return self.input_root / run_id

    def minknow_dir(self, run_id: str):
        return path.join(self.input_dir(run_id), "minknow")

    def output_dir(self, run_id: str):
        return self.output_root / run_id

    async def save_input(self, run_id: str, barcodes_file: UploadFile, minknow_zip: UploadFile):
        # Create minknow folder
        run_dir = self.input_dir(run_id)
        minknow_dir = run_dir / "minknow"
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
        barcodes_file_path = run_dir / barcodes_file.filename
        with barcodes_file_path.open(mode="wb") as saved_barcodes_file:
            barcodes_content = await barcodes_file.read()
            saved_barcodes_file.write(barcodes_content)

<<<<<<< HEAD
    def make_output_dir(self, run_id):
        output_dir = self.output_dir(run_id)
        makedirs(output_dir)
        return output_dir
=======
    def save_output(self, run_id: str):
        # Currently just write out a fake report.html and a csv file in a subfolder
        # These will be zipped for results download
        out_dir = self.output_dir(run_id)
        out_dir.mkdir(parents=True)
        report_file_path = out_dir / REPORT_FILENAME
        lines = [
            "<!doctype html>",
            "<html lang='en'>",
            "<head><meta charset='utf-8'><title>Fake Piranha report</title></head>",
            f"<body><h1>Fake Piranha report</h1><p>Report for run {run_id}</p></body>",
            "</html>",
        ]
        with report_file_path.open(mode="w") as report_file:
            report_file.writelines(lines)
>>>>>>> main

    def read_output_report(self, run_id: str):
        input_dir = self.input_dir(run_id)
        if not input_dir.exists():
            raise HTTPException(status_code=400, detail=f"Run ID {run_id} not found.") from None
        output_dir = self.output_dir(run_id)
        report_file_path = output_dir / REPORT_FILENAME
        if not report_file_path.exists():
            raise HTTPException(status_code=400, detail=f"Run {run_id} has not completed.") from None
        with report_file_path.open() as report_file:
            return report_file.read()
