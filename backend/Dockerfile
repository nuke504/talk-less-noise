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
RUN apt-get update && \
    apt-get upgrade && \
    apt-get install curl -y

# Install Poetry
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

COPY pyproject.toml .
COPY /app app/

# Test using pytest
FROM base AS test
COPY poetry_test.lock poetry.lock
RUN poetry install && \
    chown -R backend:backend $APP_HOME
COPY /test test/
USER backend
CMD ["pytest"]

FROM base AS production
COPY poetry_production.lock poetry.lock
RUN poetry install --no-dev && \
    chown -R backend:backend $APP_HOME
COPY entrypoint.sh .
COPY gunicorn.conf.py .

USER backend
# run entrypoint.sh
# gunicorn -k "$WORKER_CLASS" -c "$GUNICORN_CONF" "$APP_MODULE"
# CMD ["gunicorn","-k",${WORKER_CLASS},"-c",${GUNICORN_CONF},${APP_MODULE}]
# ENTRYPOINT ["/bin/sh","entrypoint.sh"]
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","80"]