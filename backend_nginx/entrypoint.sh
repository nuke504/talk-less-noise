#!/bin/sh
echo "BACKEND_API_URL=$BACKEND_API_URL"
envsubst '$BACKEND_API_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
exec nginx -g 'daemon off;'