FROM nginx:1.21.1-alpine AS base

FROM base AS dev
COPY default-dev.conf /etc/nginx/nginx.conf 

FROM base AS production
COPY default.conf /etc/nginx/nginx.conf 