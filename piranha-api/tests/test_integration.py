from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fake_run_streaming_response():
    params = {"run_name": "test_run"}
    files = {
        "barcodes_file": ("barcodes.csv", b"id,name\n1,sample 1", "text/csv"),
        "minknow_zip": ("minknow.zip", "fake zip", "text/plain")
    }
    # TODO: test with an actual zip file
    with client.stream("POST", "/run", params=params, files=files) as response:
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/plain; charset=utf-8"
        lines = []
        for line in response.iter_lines():
            print("appending")
            lines.append(line)
        assert len(lines) == 6

# TODO: test can run multiple requests at once