import httpx
import pytest
from app.main import app

# TODO: support async by default in toml file
@pytest.mark.asyncio
async def test_fake_run_streaming_response():
    params = {"run_name": "test_run"}
    files = {
        "barcodes_file": ("barcodes.csv", b"id,name\n1,sample 1", "text/csv"),
        "minknow_zip": ("minknow.zip", "fake zip", "text/plain")
    }
    # TODO: test with an actual zip file
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        async with client.stream("POST", "/run", params=params, files=files) as response:
            assert response.status_code == 200
            assert response.headers["content-type"] == "text/plain; charset=utf-8"
            lines = []
            async for line in response.aiter_text():
                lines.append(line)
            assert len(lines) == 6
            # TODO: test line text matches expected

# TODO: test can run multiple requests at once