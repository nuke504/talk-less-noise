# Use the official Python base image
FROM python:3.11-slim

# create directory for the backend user
ENV APP_HOME=/home/backend
RUN mkdir -p ${APP_HOME} && \
    addgroup --system backend && \
    adduser --system --group backend
WORKDIR ${APP_HOME}
ENV PYTHONPATH=/

# Update Packages
RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install curl -y

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
    ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry && \
    poetry config virtualenvs.create false

COPY pyproject.toml .

# Install Poetry
RUN poetry install --no-root --no-interaction --no-ansi && \
    chown -R backend:backend $APP_HOME

# Copy the application code
COPY main.py .

# Run the listener
CMD ["python", "main.py"]
