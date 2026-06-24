# piranha-api

A [FastAPI](https://fastapi.tiangolo.com/) interface allowing the PiranhaNET electron and web applications to run
[Piranha](https://github.com/polio-nanopore/piranha) jobs and retrieve results.

## Requirements
This project is managed with [uv](https://docs.astral.sh/uv/).

## Docker

The API can only be run from within its docker container, where it is build with access to a Piranha environment.

Build the docker image with `./scripts/build-docker-dev`
Run the API container with `./scripts/run-docker-dev`
Stop the docker container with `./scripts/stop-docker-dev`

## Tests

Run tests with `uv run pytest`. The API must be running for the integration tests to pass.

## Lint

Run a lint check with: `uv run ruff check .`
Run a lint fix with: `uv run ruff check --fix .`
Run formatting with: `uv run ruff format .`