#!/bin/sh
envsubst < /etc/nginx/conf.d/default-azure.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'