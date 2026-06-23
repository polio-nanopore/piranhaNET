# ==========================================
# Stage 1: Build Piranha and pack environment
# ==========================================
FROM condaforge/mambaforge AS piranha-builder
WORKDIR /data
# ... (Fetch Piranha and install via conda-pack) ...
RUN git clone https://github.com/polio-nanopore/piranha.git \
    && cd piranha \
    && mamba env create -f environment.yml \
    && conda install -n piranha -c conda-forge conda-pack \
    && conda-pack -n piranha -o /tmp/env.tar \
    && mkdir /venv && cd /venv
    && ./bin/conda-unpack


# ==========================================
# Stage 2: Copy and run the API
# ==========================================
FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl # TODO: do I need this?
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
COPY --from=piranha-builder /venv /venv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache --no-dev # install deps
COPY app/ ./app/
EXPOSE 8000
CMD ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "8000", "--host", "0.0.0.0"]
