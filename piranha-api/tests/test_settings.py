from pathlib import Path
from unittest.mock import patch

from app.settings import Settings


@patch.dict("os.environ", {"INPUT_DIR": "/env/input"})
@patch.dict("os.environ", {"OUTPUT_DIR": "/env/output"})
def test_can_load_settings_from_env():
    settings = Settings()
    assert settings.input_dir == "/env/input"
    assert settings.output_dir == "/env/output"


def test_default_settings_when_not_in_env():
    settings = Settings()
    assert settings.input_dir == f"{Path.cwd()}/requests-data/input"
    assert settings.output_dir == f"{Path.cwd()}/requests-data/output"
