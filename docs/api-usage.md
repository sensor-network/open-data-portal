# How to use the API and Upload Sensor Data

**This guide is intended to help you get started when using the API to upload data from your sensor stations. For exact
usage of each endpoint take a look at the API documentation [`/docs`]() after launching the application.**

In order to follow along, keep the database model below in mind:

![database model](db-model.png)

**Terminology:**

- sensor - a module that is measuring a specific parameter, e.g. a thermometer measuring temperature
- station - a collection of sensors combined into a box with a GPS and a driver which controls the sensors
- measurement - a single reading of a sensor
- history - a summary of the measurements taken by a sensor. this table is updated automatically at midnight every day
- location - a named position with geo-coordinates and a given radius. When measurements are taken, the location is
  checked to see if the measurement is within the radius of any existing location. Otherwise, a new location is created
  that can be manually named later.

## Setting up your sensor

_Note: By default, all POST endpoints require authentication. This is currently done using `Bearer` schema and the token is set in the [compose](/docker-compose.yml) file in the project root. By default, the token is `default`._

### Register your sensors

The sensors are the individual devices that will be used to collect data of a certain type, for example a thermometer.
The following POST request to the `/sensors` endpoint will create a new `temperature` sensor, which I will
name `rkz1000` (perhaps its model number) and it runs firmware `1.3.1`.

_Note: The meta-data `name` and `firmware` are not mandatory and can be left out and updated later_

```sh
POST: /api/<api_version>/sensors
JSON BODY:
{
    "type": "temperature",
    "name": "rkz1000",
    "firmware": "1.3.1"
}

Using curl (again, assuming running the application locally):
$ curl --request POST \
  --url http://localhost:3000/api/<api_version>/sensors \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer default' \
  --data '{
	"type": "temperature",
	"name": "rkz1000",
	"firmware": "1.3.1"
}'
```

The endpoint returns the id (lets assume it returned `1`) of the sensor. You will need this later if you want to link a
sensor to a station.

### Create a new location where you will place the sensor station

In order to create a location, send a POST request to the `/locations`
endpoint. In this example, I will create a new location for `Gräsvik`.

```sh
POST: /api/<api_version>/locations
JSON BODY:
{
	"name": "Gräsvik",
	"lat": 56.182421,
	"long": 15.589274,
	"rad": 1000
}

Using curl (assuming running the application locally):
$ curl --request POST \
  --url http://localhost:3000/api/<api_version>/locations \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer default' \
  --data '{
	"name": "Gräsvik",
	"lat": 56.182421,
	"long": 15.589274,
	"rad": 1000
}'
```

The endpoint returns the id of the location (lets assume it returned `1`). You will need this later in order to link your sensors to a station.

### Link your sensors to your location with a sensor station

A sensor station is a collection of sensors that are placed at a location. The following POST request will create a new
station with the sensor we just created. I will also place the station in the location we created earlier.

```sh
POST: /api/<api_version>/stations
JSON BODY:
{
    "locationId": 1,
    "sensorIds": [1]
}

Using curl (again, assuming running the application locally):
$ curl --request POST \
  --url http://localhost:3000/api/<api_version>/stations \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer default' \
  --data '{
    "locationId": 1,
    "sensorIds": [1]
}'
```

Now everything is set up, and we can start collecting data.

## Collecting data

_Note: all the previous steps are one-time-setups and can be done remotely using e.g. Curl. The following should only be
done using proper sensors to ensure the data displayed is accurate._

### Upload measurements

Now that we have a sensor station, we can upload measurements from it. The following POST request will upload a
measurement of `23.5°C`.

No need to supply the type of measurement since this is already registered.

The location provided will be linked to the closest location in the database. If no location is found within their
respective radius', a new Location will be created. This functionality is especially useful if you have your sensors
placed on a boat and are moving around. It is recommended to go and update the name of the automatically created
locations afterwards so that the frontend works properly.

If you uploaded the `Gräsvik` location, your measurement will be linked to that location as long as the distance is less
than the radius we provided, 1000m.

```sh
POST: /api/<api_version>/measurements
JSON BODY:
{
    "time": "2022-04-08T14:08:54+02",
    "stationId": 1,
    "position": {
      "lat": 56.182421,
      "long": 15.589274
    },
    "sensors": [
        { "id": 1, "value": 23.5, "unit": "c" }
    ]
}

Using curl (again, assuming running the application locally):
$ curl --request POST \
  --url http://localhost:3000/api/<api_version>/measurements \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer default' \
  --data '{
	"time": "2022-04-08T14:08:54+02",
    "stationId": 1,
	"position": {
      "lat": 56.182421,
      "long": 15.589274
    },
	"sensors": [
		{"id": 1, "value": 23.5, "unit": "c"}
	]
}'
```

That's it! You can now see the data in the database (or using the API at `http://localhost:3000/api/v3/measurements`). This query can be used to continuously upload data from your
sensor. If you have multiple sensors at the same station, lets say a conductivity sensor which measures total dissolved
solids, just specify multiple sensors in the `sensors` field. Note that the sensors should be registerred and linked as described above:

```json
{
  "time": "2022-04-08T14:08:54+02",
  "stationId": 1,
  "position": {
    "lat": 56.182421,
    "long": 15.589274
  },
  "sensors": [
    {
      "id": 1,
      "value": 23.5,
      "unit": "c"
    },
    {
      "id": 2,
      "value": 40000,
      "unit": "ppm"
    }
  ]
}
```

You can also send multiple measurements at the same time, for example if your station lost internet connection and collected measurements without sending them up to the server. To do so, provide the measurements as an array:

```json
[
  {
    "time": "",
    "stationId": 1,
    "position": {},
    "sensors": [],
  },
  { ... },
  ...
],
```

### Monitoring the sensors statuses

You can see the status of each sensor using the `/health/sensors` endpoint. For example, if you forgot to
specify `"unit": "c"`, the API would interpret the measurement as `23.5 K` and the measurement would not be allowed
since this is an unreasonable temperature value. The status of the sensor would then be updated to `TOO_LOW`. After which, a query to the API would return something like this:

```sh
GET: /api/<api_version>/health/sensors

Response: [
  {"id": 1, "type": "temperature", "status": "TOO_LOW", "last_active": "2022-04-08T12:08:54.000Z"},
  {"id": 2, "type": "conductivity", "status": "OK", "last_active": "2022-04-08T12:08:54.000Z"}
]
```

If the status is `OK`, the sensor is operating normally in the sense that its measurements are being accepted by the
API. If the measurements are being declined, an appropriate status is displayed, e.g:

- `TOO_LOW`, `TOO_HIGH` - the sensor is sending measurements out of the accepted range.
- `ER_DUP_ENTRY` - the sensor is sending a measurement with a timestamp that is already in the database
- `SENSOR_NOT_FOUND` - the sensor is not registerred in the database.
- `SENSOR_NOT_LINKED` - the sensor is not linked to the station provided in the request JSON.

You could also query the `/health/stations` to get the statuses grouped by station. A station's health is determined like:

- `OK` - all the sensors linked to the station is operating normally
- `PARTIALLY FAULTY` - at least one sensor has some error
- `FAULTY` - all the sensors at the station are faulty.
