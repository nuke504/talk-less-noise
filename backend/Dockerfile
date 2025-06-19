# syntax=docker/dockerfile:1.2
FROM python:3.9.6-slim AS base

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

# Copy app contents
COPY /app app/

# Test using pytest
FROM base AS test
RUN poetry install && \
    chown -R backend:backend $APP_HOME
COPY /test test/
USER backend
CMD ["pytest"]

FROM base AS production
RUN apt update && apt install -y iputils-ping curl net-tools dnsutils
RUN poetry install --only main && \
    chown -R backend:backend $APP_HOME
COPY gunicorn.conf.py .
EXPOSE 8080/tcp

HEALTHCHECK --interval=5m --timeout=3s \
    CMD curl -f http://localhost/ || exit 1

USER backend
CMD ["gunicorn","app.main:app","-k","uvicorn.workers.UvicornWorker","-c","./gunicorn.conf.py"]
# CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000"]