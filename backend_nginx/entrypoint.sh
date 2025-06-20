#!/bin/sh
echo "BACKEND_API_URL=$BACKEND_API_URL"
envsubst '$BACKEND_API_URL' < /etc/nginx/conf.d/default-bridge.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'