# Talk Less Noise

<img alt="Logo" align="right" src="/frontend/app/src/img/mascot/noisemascot-horn.png" width="20%" />

This repository contains the code for the Talk Less Noise Campaign. It comprises two main parts: the FastAPI backend and React frontend.

## Architecture

<img alt="Talk Less Noise Architecture" align="center" src="/docs/architecture-overview.png" width="100%"/>

## Repository Overview

The folder and files are structured in the following manner

```
talk-less-noise
├── .github/workflows
├── README.md
├── .gitignore
├── docker-compose.yml
├── backend
├── backend_nginx
├── docs
├── frontend
└── mongo_config
```

The descriptions of the folders are as below:
| Folder/File | Description |
| ----------- | ----------- |
| README.md | Readme |
| .gitignore | Git Ignore File |
| docker-compose.yml | Docker Compose File to test both frontend and backend |
| .github/workflows | Github Actions to trigger build container image for Github Container Repository and Azure Container Repository |
| backend | Python code for backend FastAPI Server |
| backend_nginx | Nginx Config for backend proxy Nginx Server |
| docs | Documents related to the software architecture |
| frontend | Javascript code for frontend React App |
| mongo_config | Javascript code for Mongo DB Shell. Used to set up database parts |

_This repository does not include the configuration or shell files required to set up Talk Less Noise on Azure._

To run the entire app (frontend + backend):

`sh docker compose up --build -d `

_You will need to download and run the Docker Daemon before running the above command._

This will build the Docker image for both the frontend and the back, and deploy both containers locally as a collection of microservices.

To access the frontend app, open [http://localhost:3000/](http://localhost:3000/). The backend is located at [http://localhost:8000/](http://localhost:8000/) using a Swagger UI interface.

Note that you **will not be able to post anything** to the mongo DB database (i.e. run the frontend properly) unless your **IP is first whitelisted**. Attempting to do so before whitelisting will result in errors (the error will appear on the screen).

## Proxy Server Backend

The backend traffic to the FastAPI server is routed through Nginx. The config file can be found in `backend_nginx`.

## FastAPI Backend

THe backend files can be found in `backend`. They are organised according to this structure:

```
talk-less-noise/backend
├── app
│   ├── api
│   │   ├── endpoints
│   │   ├── __init__.py
│   │   └── deps.py
│   ├── config
│   ├── db
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── operations.py
│   ├── schemas
│   ├── service
│   ├── utils
│   └── main.py
├── test
├── .dockerignore
├── Dockerfile
├── gunicorn.conf.py
├── poetry_production.lock
├── poetry_test.lock
└── pyproject.toml
```

| Folder/File            | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| app                    | Main folder comprising all application files                             |
| app/api                | API layer specifying api endpoints                                       |
| app/config             | Files for configuring FastAPI, such as values to validate against        |
| app/db                 | Code for CRUD operations using Motor                                     |
| app/schemas            | Schemas representing IO objects                                          |
| app/service            | Service layer for more complex get operations                            |
| app/utils              | Utils code, such as code for logging                                     |
| app/main.py            | Entrypoint for Uvicorn Worker                                            |
| test                   | Tests written for the backend. Run with `pytest`                         |
| .dockerignore          | docker ignore file                                                       |
| Dockerfile             | Backend FastAPI Dockerfile                                               |
| gunicorn.conf.py       | Gunicorn Configuration File                                              |
| poetry_production.lock | List of exact versions of each package to be installed during production |
| poetry_test.lock       | List of exact versions of each package to be installed during testing    |
| pyproject.toml         | Poetry project file                                                      |

Packages for the backend are managed using [Poetry](https://python-poetry.org). It is a package manager analogous to _npm_ for python.

The backend is split into multiple layers:

1. API layer - This layer specifies the API endpoints and is directly used for all GET, PUT and POST requests.
2. Service layer - Optional layer that is used for more complex GET requests.
3. DB Layer - The service layer and API layer will tap on the DB layer to perform the necessary CRUD operations.

Due to the reliance of FastAPI on [Pydantic](https://pydantic-docs.helpmanual.io), it is necessary to specify typehints and Schemas for all request objects.

[Gunicorn](https://gunicorn.org) is a tool used to coordinate and run multiple Uvicorn workers. FastAPI runs on Uvicorn.

### Testing the Backend

To test the backend, simply run the following command:

```sh
cd test
pytest
```

To run the test successfully, your local IP address has to be **whitelisted**. Otherwise the tests will fail. Tests will cleanup automatically (remove all test records on the database).

## React Frontend

THe frontend files can be found in `frontend`. They are organised according to this structure:

_Not all files/folders are shown. Only important ones are shown_

```
talk-less-noise/frontend
├── app
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── img
│   │   ├── pages
│   │   ├── utils
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── config.js
│   │   ├── index.css
│   │   └── index.js
│   ├── package-lock.json
│   └── package.json
├── .dockerignore
├── Dockerfile
├── Dockerfile.local
└── Dockerfile.remote
```

| Folder/File           | Description                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| app                   | Main folder comprising all React application files                                           |
| app/public            | Public Folder containing index.html, favicon and thumbnail images                            |
| app/src               | Main folder containing files that will be compressed using Webkit and polyfilled using Babel |
| app/src/components    | React Components that can be reused throughout the frontend                                  |
| app/src/img           | Images for frontend                                                                          |
| app/src/pages         | Slide React Components                                                                       |
| app/src/utils         | AJAX utils for Frontend. Uses [Axios](https://axios-http.com)                                |
| app/src/App.js        | App entrypoint                                                                               |
| app/src/App.css       | Base CSS styles                                                                              |
| app/src/index.js      | React entrypoint                                                                             |
| app/package-lock.json | NPM file that specifies each package's exact version                                         |
| app/package.json      | NPM file that specifies each package                                                         |
| .dockerignore         | docker ignore file                                                                           |
| Dockerfile            | Frontend Dockerfile. Does not build (i.e. run as a node container)                           |
| Dockerfile.local      | Frontend Dockerfile. Builds and stores in Nginx container                                    |
| Dockerfile.remote     | Frontend Dockerfile. Configured for remote deployment                                        |

The frontend is created using [Create React App](https://create-react-app.dev). As such its folder structure is similar to that created using Create React App. Refer to its documentation for more details.

## Mongo Config

This folder contains javascript snippets that are used to setup the MongoDB Database Schemas, as well as some insertion tests to check if the schemas work.

## Talk Less Noise

Talk Less Noise is open source software [licensed as MIT](https://github.com/facebook/create-react-app/blob/main/LICENSE).
