FROM nginx:1.21.1-alpine AS base

RUN apk add --no-cache gettext

FROM base AS bridge
COPY default-bridge.conf /etc/nginx/conf.d/default.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Keep the 'localhost' stage if you need it, but it's not used by the 'bridge' stage
FROM base AS localhost
COPY default-localhost.conf /etc/nginx/nginx.conf