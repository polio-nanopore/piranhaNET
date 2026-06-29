import asyncio
import json
import pytest
from io import BytesIO
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import httpx

BASE_URL = "http://127.0.0.1:8000"
RUN_ID_HEADER = "piranhanet-run-id"

test_data_dir = Path.cwd().parent / "test-data"


def create_minknow_zip():
    # Create a zip file to upload from the real test data
    folder = test_data_dir / "demultiplexed"
    zip_buffer = BytesIO()
    with ZipFile(zip_buffer, 'w', ZIP_DEFLATED) as zf:
        for file_path in folder.rglob('*'):
            if file_path.is_file():
                archive_name = file_path.relative_to(folder)
                zf.write(file_path, archive_name)

    # Reset buffer position
    zip_buffer.seek(0)
    return zip_buffer


def create_files():
    minknow_zip = create_minknow_zip()
    barcodes_path = test_data_dir / "barcodes.csv" # read test_data barcodes file
    return {
        "barcodes_file": ("barcodes.csv", barcodes_path.read_text(), "text/csv"),
        "minknow_zip": ("minknow.zip", minknow_zip, "application/zip"),
    }


async def stream_to_list(response, output_list):
    async for line in response.aiter_text():
        output_list.append(line)


async def test_run_streaming_response_and_get_results():
    params = {"run_name": "test run"}
    files = create_files()

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        async with client.stream("POST", "/run", params=params, files=files, timeout=None) as response:
            assert response.status_code == 200
            assert response.headers["content-type"] == "text/plain; charset=utf-8"
            run_id = response.headers[RUN_ID_HEADER]
            assert len(run_id) == 42
            lines = []
            async for line in response.aiter_text():
                lines.append(line)
            print(lines)
            # We'll need to change this when we're running the real Piranha process
            assert len(lines) == 7
            assert lines[0] == f"{run_id} Starting fake Piranha process for test run"
            assert lines[1] == f"{run_id} Barcodes filename is barcodes.csv"
            assert lines[2] == f"{run_id} MinKnow zipname is minknow.zip"
            assert lines[3] == f"{run_id} Fake Piranha update 1"
            assert lines[4] == f"{run_id} Fake Piranha update 2"
            assert lines[5] == f"{run_id} Saving output files"
            assert lines[6] == f"{run_id} Fake Piranha completed"

    with httpx.Client(base_url=BASE_URL) as client:
        results_response = client.get(f"/results/{run_id}")
        assert results_response.status_code == 200
        assert f"Report for run {run_id}" in results_response.text

@pytest.mark.skip(reason="local skip")
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
                await asyncio.gather(stream_to_list(response_1, combined), stream_to_list(response_2, combined))
                # Expect interleaved streamed response list to show that responses were collecting concurrently
                # We'll need to change this when we're running the real Piranha process
                assert len(combined) == 14
                assert combined[0] == f"{run_id_1} Starting fake Piranha process for test run 1"
                assert combined[3] == f"{run_id_2} Starting fake Piranha process for test run 2"
                assert combined[11] == f"{run_id_1} Fake Piranha completed"
                assert combined[13] == f"{run_id_2} Fake Piranha completed"


@pytest.mark.skip(reason="local skip")
async def test_expected_error_when_minknow_not_valid_zip():
    params = {"run_name": "test run"}
    files = {
        "barcodes_file": ("barcodes.csv", b"id,name\n1,sample 1\n2,sample 2", "text/csv"),
        "minknow_zip": ("minknow.zip", "not a zip", "application/zip"),
    }
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        async with client.stream("POST", "/run", params=params, files=files) as response:
            assert response.status_code == 400
            lines = []
            async for line in response.aiter_text():
                lines.append(line)
            assert len(lines) == 1
            json_error = json.loads(lines[0])
            assert json_error["detail"] == "Invalid zip file."

@pytest.mark.skip(reason="local skip")
async def test_expected_error_when_run_does_not_exist():
    run_id = "nope"
    with httpx.Client(base_url=BASE_URL) as client:
        response = client.get(f"/results/{run_id}")
        assert response.status_code == 400
        json_error = response.json()
        assert json_error["detail"] == f"Run ID {run_id} not found."

@pytest.mark.skip(reason="local skip")
async def test_expected_error_when_run_has_not_completed():
    # Start run and request its results before it has time to complete
    params = {"run_name": "test run"}
    files = create_files()

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        async with client.stream("POST", "/run", params=params, files=files) as response:
            run_id = response.headers[RUN_ID_HEADER]
            await asyncio.sleep(1)  # give it time to save run id folder
            with httpx.Client(base_url=BASE_URL) as results_client:
                results_response = results_client.get(f"/results/{run_id}")
                assert results_response.status_code == 400
                json_error = results_response.json()
                assert json_error["detail"] == f"Run {run_id} has not completed."
            # wait for the task to finish
            await asyncio.gather(stream_to_list(response, []))
