[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/sensor-network/open-data-portal/actions/workflows/integrate.yml/badge.svg)](https://github.com/sensor-network/open-data-portal/actions/workflows/integrate.yml)

# open-data-portal

Open Data Portal for Waterquality Sensor Data

## Introduction

TODO: Add brief introduction.

## Architecture Overview
The diagram shows the different parts of the system and how they interact with each other. The external sensor system can be found [here](https://github.com/sensor-network/sensor-collector).

![Architecture Overview Diagram](docs/architecture.png)

## How to Use
This application can be built and run in two ways:

### Using Docker and Docker Compose (Packaged with a mySQL database)
#### Prerequisites
- [Docker](https://docker.com)
- [Docker Compose](https://docs.docker.com/compose/)

#### Build
If you want to build the application image yourself, you can

1. Clone the repo: 
```
$ git clone https://github.com/sensor-network/open-data-portal.git
$ cd open-data-portal
```
2. Build the image: 
```
$ docker build -t open-data-portal .
```

#### Run
If you built the image locally you can now just run the application using Docker Compose. Depending on your version of docker/docker compose:
```
$ docker compose up
# or,
$ docker-compose up
```

If you didn't build the image you can use the publicly available image from `ghcr`:
1. In `docker-compose.yml`, uncomment the line `image: ghcr.io/sensor-network/open-data-portal:main` and comment out the line `image: open-data-portal`
2. Run the application using Docker Compose as described above.

The application will then start at `localhost:3000`

### From source (supply your own database)
#### Prerequisites

- [Node.js 12.22.0](https://nodejs.org/en/) or later

#### Initial setup

1. Clone the repo:
```console
$ git clone https://github.com/sensor-network/open-data-portal.git
$ cd open-data-portal
```
2. Create a `.env` file and specify the following variables:
- NEXT_PUBLIC_DB_HOST
- NEXT_PUBLIC_DB_USER
- NEXT_PUBLIC_DB_PASSWORD
- NEXT_PUBLIC_DB_DATABASE
- NEXT_PUBLIC_API_KEY

3. Install the project's dependencies:
```console
$ npm install
```

#### Build

Build an optimized production version:
```console
$ npm run build
```

#### Test

Run all tests:
```console
$ npm test
````
Tests can also be run in `watch`-mode while developing to have them re-run each compilation:
````console
$ npm test:watch
````

***Note: This project currently does not have a significant test-base. This will be done in the future.***


#### Run

Run developer version with fast refresh:
```console
$ npm run dev
```

Or start a built production version:
```console
$ npm run start
```

Then open the app in the browser at the link shown in your terminal.


## License

Copyright (c) 2022 Julius Marminge, André Varga, Arlind Iseni, Majed Fakhr Eldin, Nils Persson Suorra

This work (source code) is licensed under [MIT](./LICENSES/MIT.txt).

Files other than source code are licensed as follows:

- Documentation and screenshots are licensed under [CC BY-SA 4.0](./LICENSES/CC-BY-SA-4.0.txt).

See the [LICENSES](./LICENSES/) folder in the root of this project for license details.
