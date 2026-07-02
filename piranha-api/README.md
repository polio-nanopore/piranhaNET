# piranha-api

A [FastAPI](https://fastapi.tiangolo.com/) interface allowing the PiranhaNET electron and web applications to run
[Piranha](https://github.com/polio-nanopore/piranha) jobs and retrieve results.

## Requirements
This project is managed with [uv](https://docs.astral.sh/uv/).

## Docker

The API can only be run from within its docker container, where it is build with access to a Piranha environment.

**IMPORTANT - if you add a non-dev dependency to pyproject.toml for local development, you'll also need to add it to the 
`install` statement in the Dockerfile.** This is because the Dockerfile uses the 
[existing piranha image](https://github.com/polio-nanopore/piranha/blob/main/Dockerfile) as its base,
and installs API dependencies into its pre-existing environment. 

Quickstart script to stop any existing container, then build and run the container: `./scripts/build-and-run-docker-dev`

Or you can use these scripts to do the steps individually:
Build the docker image with `./scripts/build-docker-dev`
Run the API container with `./scripts/run-docker-dev`
Stop the docker container with `./scripts/stop-docker-dev`


## Tests

Run tests with `uv run pytest`. The API must be running for the integration tests to pass.

## Lint

Run a lint check with: `uv run ruff check .`
Run a lint fix with: `uv run ruff check --fix .`
Run formatting with: `uv run ruff format .`