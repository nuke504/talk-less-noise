#!/bin/sh
# APP_MODULE=app.main:app
# GUNICORN_CONF=./gunicorn.conf.py
# WORKER_CLASS=uvicorn.workers.UvicornWorker

# Start Gunicorn
exec gunicorn -k "$WORKER_CLASS" -c "$GUNICORN_CONF" "$APP_MODULE"
exec "$@"