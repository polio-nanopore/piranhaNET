FROM polionanopore/piranha:latest

# /venv is already in PATH from the base image
# Just add FastAPI to the same /venv
RUN /venv/bin/pip install fastapi[standard] uvicorn shortuuid aiofiles

# Copy your FastAPI app
COPY app/ /app/app/
WORKDIR /app

EXPOSE 8000
CMD ["/venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
#CMD ["sleep", "infinity"]
# Why uvicorn and not fastapi?
# Any way to sync up with pyproject.toml? Pull the pip install packages from the dependencies section?
