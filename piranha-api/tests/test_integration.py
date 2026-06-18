import asyncio
import httpx
import pytest
from io import BytesIO
from app.main import app
from zipfile import ZipFile, ZIP_DEFLATED

BASE_URL = "http://127.0.0.1:8000"
RUN_ID_HEADER = "piranhanet-run-id"

def create_minknow_zip():
  zip_buffer = BytesIO()
  with ZipFile(zip_buffer, 'w', ZIP_DEFLATED) as zf:
    zf.writestr('sample 1/1.txt', 'Data for sample 1')
    zf.writestr('sample 2/2.txt', 'Data for sample 2')
  zip_buffer.seek(0)
  return zip_buffer

def create_files():
    minknow_zip = create_minknow_zip()
    return {
      "barcodes_file": ("barcodes.csv", b"id,name\n1,sample 1\n2,sample 2", "text/csv"),
      "minknow_zip": ("minknow.zip", minknow_zip, "application/zip")
    }


async def stream_to_list(response, list):
    async for line in response.aiter_text():
      list.append(line)

# TODO: support async by default in toml file
@pytest.mark.asyncio
@pytest.mark.skip(reason="dev")
async def test_run_streaming_response_and_get_results():
    params = {"run_name": "test run"}
    files = create_files()

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        async with client.stream("POST", "/run", params=params, files=files) as response:
            assert response.status_code == 200
            assert response.headers["content-type"] == "text/plain; charset=utf-8"
            run_id = response.headers[RUN_ID_HEADER]
            lines = []
            async for line in response.aiter_text():
                lines.append(line)
            # We'll need to change this when we're running the real Piranha process
            assert len(lines) == 8
            # TODO: test line text matches expected

    with httpx.Client(base_url=BASE_URL) as client:
        results_response = client.get(f"/results/{run_id}")
        assert results_response.status_code == 200
        assert f"Report for run {run_id}" in results_response.text

@pytest.mark.asyncio
async def test_simultaneous_run_requests():
    params_1 = {"run_name": "test run 1"}
    files_1 = create_files()
    params_2 = {"run_name": "test run 2"}
    files_2 = create_files()
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
      async with client.stream("POST", "/run", params=params_1, files=files_1) as response_1:
        async with client.stream("POST", "/run", params=params_2, files=files_2) as response_2:
          assert response_1.status_code == 200
          assert response_2.status_code == 200
          run_id_1 = response_1.headers[RUN_ID_HEADER]
          run_id_2 = response_2.headers[RUN_ID_HEADER]
          combined = []
          await asyncio.gather(
            stream_to_list(response_1, combined),
            stream_to_list(response_2, combined)
          )
          # Expect interleaved streamed response list to show that responses were collecting concurrently
          # We'll need to change this when we're running the real Piranha process
          assert len(combined) == 16
          assert combined[0] == f"{run_id_1} Starting fake Piranha process"
          assert combined[4] == f"{run_id_2} Starting fake Piranha process"
          assert combined[13] == f"{run_id_1} Fake Piranha completed"
          assert combined[15] == f"{run_id_2} Fake Piranha completed"
