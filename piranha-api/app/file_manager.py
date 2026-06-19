from os import makedirs, path
from zipfile import BadZipFile, ZipFile

from fastapi import HTTPException, UploadFile

REPORT_FILENAME = "report.html"


class FileManager:
    def __init__(self, input_root, output_root):
        self.input_root = input_root
        self.output_root = output_root

    def input_dir(self, run_id: str):
        return path.join(self.input_root, run_id)

    def output_dir(self, run_id: str):
        return path.join(self.output_root, run_id)

    async def save_input(self, run_id: str, barcodes_file: UploadFile, minknow_zip: UploadFile):
        # Create minknow folder
        run_dir = self.input_dir(run_id)
        minknow_dir = path.join(run_dir, "minknow")
        print(f"Creating dir {minknow_dir}")
        makedirs(minknow_dir)
        # Unzip minknow to minknow folder
        try:
            with ZipFile(minknow_zip.file) as zip_file:
                zip_file.extractall(minknow_dir)
        except BadZipFile:
            raise HTTPException(status_code=400, detail="Invalid zip file.") from None
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
            "</html>",
        ]
        with open(report_file_path, "w") as report_file:
            report_file.writelines(lines)

    def read_output_report(self, run_id: str):
        input_dir = self.input_dir(run_id)
        if not path.exists(input_dir):
            raise HTTPException(status_code=400, detail=f"Run ID {run_id} not found.") from None
        output_dir = self.output_dir(run_id)
        report_file_path = path.join(output_dir, REPORT_FILENAME)
        if not path.exists(report_file_path):
            raise HTTPException(status_code=400, detail=f"Run {run_id} has not completed.") from None
        with open(report_file_path) as report_file:
            return report_file.read()
