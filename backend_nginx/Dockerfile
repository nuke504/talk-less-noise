FROM nginx:1.21.1-alpine AS base

FROM base AS bridge
COPY default-bridge.conf /etc/nginx/nginx.conf 

FROM base AS localhost
COPY default-localhost.conf /etc/nginx/nginx.conf 