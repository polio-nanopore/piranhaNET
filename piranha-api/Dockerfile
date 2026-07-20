FROM polionanopore/piranha:latest

# Add our dependencies to the existing conda venv from the base image
RUN /venv/bin/pip install fastapi[standard] uvicorn shortuuid aiofiles

# Copy the FastAPI app
COPY app/ /app/app/
WORKDIR /app

EXPOSE 8000
CMD ["/venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
