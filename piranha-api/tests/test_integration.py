import httpx
import pytest
from io import BytesIO
from app.main import app
from zipfile import ZipFile, ZIP_DEFLATED

BASE_URL = "http://127.0.0.1:8000"

def create_minknow_zip():
  zip_buffer = BytesIO()
  with ZipFile(zip_buffer, 'w', ZIP_DEFLATED) as zf:
    zf.writestr('sample 1/1.txt', 'Data for sample 1')
    zf.writestr('sample 2/2.txt', 'Data for sample 2')
  zip_buffer.seek(0)
  return zip_buffer

# TODO: support async by default in toml file
@pytest.mark.asyncio
async def test_fake_run_streaming_response():
    params = {"run_name": "test_run"}
    minknow_zip = create_minknow_zip()
    files = {
        "barcodes_file": ("barcodes.csv", b"id,name\n1,sample 1\n2,sample 2", "text/csv"),
        "minknow_zip": ("minknow.zip", minknow_zip, "application/zip")
    }

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        async with client.stream("POST", "/run", params=params, files=files) as response:
            assert response.status_code == 200
            assert response.headers["content-type"] == "text/plain; charset=utf-8"
            run_id = response.headers["piranhanet-run-id"]
            lines = []
            async for line in response.aiter_text():
                lines.append(line)
            assert len(lines) == 8
            # TODO: test line text matches expected

    with httpx.Client(base_url=BASE_URL) as client:
        results_response = client.get(f"/results/{run_id}")
        assert results_response.status_code == 200
        assert f"Report for run {run_id}" in results_response.text

# TODO: test can run multiple requests at once