from pydantic_settings import BaseSettings

# Pydantic settings expect environment variables which are upper case versions of the python names, or fall back to given
# defaults
class Settings(BaseSettings):
  input_dir: str = "input"
  output_dir: str = "output"
  # TODO: sort out defaults

settings = Settings()