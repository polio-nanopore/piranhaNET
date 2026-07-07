from pathlib import Path

from pydantic_settings import BaseSettings

# Pydantic settings expect environment variables which are upper case versions of the python names, or falls back to
# given defaults
DATA_ROOT = "requests-data"


class Settings(BaseSettings):
    input_dir: str = str(Path.cwd() / DATA_ROOT / "input")
    output_dir: str = str(Path.cwd() / DATA_ROOT / "output")
    piranha_venv_path: str = "venv/bin"


settings = Settings()
