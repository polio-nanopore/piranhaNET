from os import getcwd, path

from pydantic_settings import BaseSettings

# Pydantic settings expect environment variables which are upper case versions of the python names, or falls back to
# given defaults
DATA_ROOT = "requests-data"


class Settings(BaseSettings):
    input_dir: str = path.join(getcwd(), DATA_ROOT, "input")
    output_dir: str = path.join(getcwd(), DATA_ROOT, "output")


settings = Settings()
