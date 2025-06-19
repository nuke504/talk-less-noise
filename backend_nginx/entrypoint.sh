#!/bin/sh
echo "BACKEND_API_URL=$BACKEND_API_URL"
# envsubst < /etc/nginx/conf.d/default-bridge.conf.template > /etc/nginx/conf.d/default.conf
echo "----- /etc/nginx/conf.d/default.conf -----"
cat /etc/nginx/conf.d/default.conf
echo "------------------------------------------"
curl -v http://backend-api.internal.tln-cae.southeastasia.azurecontainerapps.io:8080
exec nginx -g 'daemon off;'