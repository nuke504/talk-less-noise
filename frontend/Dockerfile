# pull official base image
FROM node:16-slim AS base

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY /app/package.json /app/package.json
COPY /app/package-lock.json /app/package-lock.json
RUN npm install
RUN npm install react-scripts@4.0.3 -g

# add app
COPY /app ./

FROM base AS dev
CMD ["npm", "start"]

FROM base AS build
RUN npm run build

FROM nginx:1.21.1-alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
# COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]