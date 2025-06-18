FROM nginx:1.21.1-alpine AS base

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

FROM base AS bridge
COPY default-bridge.conf /etc/nginx/conf.d/default-bridge.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

FROM base AS localhost
COPY default-localhost.conf /etc/nginx/nginx.conf 