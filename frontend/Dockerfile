# pull official base image
FROM node:16-slim AS base

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH=/app/node_modules/.bin:$PATH

# install app dependencies
COPY /app/package.json /app/package.json
COPY /app/package-lock.json /app/package-lock.json
RUN npm install
RUN npm install react-scripts@4.0.3 -g

# add app
COPY /app ./
ENV REACT_APP_API_ADDRESS="https://talk-less-noise-api.azurewebsites.net/api"
ENV REACT_APP_NAME="talk-less-noise-dev"
CMD ["NODE_OPTIONS=--openssl-legacy-provider","npm", "start"]
