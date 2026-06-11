# piranha-api

A [FastAPI](https://fastapi.tiangolo.com/) interface allowing the PiranhaNET electron and web applications to run
[Piranha](https://github.com/polio-nanopore/piranha) jobs and retrieve results.

## Requirements
This project is managed with [uv](https://docs.astral.sh/uv/).

## Run API

You can run the API outside docker with `uv run fastapi dev`. However, it will only be able to interact with Piranha
when run within the Docker container (not yet implemented).