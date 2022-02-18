[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/sensor-network/open-data-portal/actions/workflows/integrate.yml/badge.svg)](https://github.com/sensor-network/open-data-portal/actions/workflows/integrate.yml)
[![Container](https://github.com/sensor-network/open-data-portal/actions/workflows/docker.yml/badge.svg)](https://github.com/sensor-network/open-data-portal/actions/workflows/docker.yml)

# open-data-portal

Open Data Portal for Waterquality Sensor Data

## Introduction

TODO: Add brief introduction.

## Architecture Overview
The diagram shows the different parts of the system and how they interact with each other. The external sensor system can be found [here](https://github.com/sensor-network/sensor-collector).

![Architecture Overview Diagram](docs/architecture.png)

## How to Use

### From source

#### Prerequisites

- [NodeJS 12.22.0](https://nodejs.org/en/) or later

#### Initial setup

1. Clone the repo:
```console
$ git clone https://github.com/sensor-network/open-data-portal.git
```

2. Create a `.env`-file in the project root `/` and fill in the following:
```
NEXT_PUBLIC_DB_URL   = <your connection string for your database>
NEXT_PUBLIC_API_KEY1 = <static api keys used to securely upload data using the `/upload` endpoint>
NEXT_PUBLIC_API_KEY2 = <static api keys used to securely upload data using the `/upload` endpoint>
NEXT_PUBLIC_API_KEY3 = <static api keys used to securely upload data using the `/upload` endpoint>
NEXT_PUBLIC_API_KEY4 = <static api keys used to securely upload data using the `/upload` endpoint>
NEXT_PUBLIC_API_KEY5 = <static api keys used to securely upload data using the `/upload` endpoint>
```

#### Build

Use `npm` to install dependencies:
```console
$ npm install
```

Build production version:
```console
$ npm run build
```

#### Test

Run all tests:
````console
$ npm run test
````
Tests can also be run in `watch`-mode while developing to have them re-run each compilation:
````console
$ npm run test:watch
````

***Note: This project currently does not have a significant test-base. This will be done in the future.***


#### Run

Run developer version:
```console
$ npm run dev
```

Or start a built production version:
```console
$ npm run start
```

Then open the app in the browser at the link shown in your terminal.

### Using Docker Container

You can also run the application inside a Docker Container.

TODO: Explain how to use with docker

## License

Copyright (c) 2022 Julius Marminge, André Varga, Arlind Iseni, Majed Fakhr Eldin, Nils Persson Suorra

This work (source code) is licensed under [MIT](./LICENSES/MIT.txt).

Files other than source code are licensed as follows:

- Documentation and screenshots are licensed under [CC BY-SA 4.0](./LICENSES/CC-BY-SA-4.0.txt).

See the [LICENSES](./LICENSES/) folder in the root of this project for license details.
