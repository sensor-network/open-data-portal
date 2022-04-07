# How to use the API and Upload Sensor Data

**This guide is intended to help you get started when using the API to upload data from your sensor stations. For exact
usage of each endpoint take a look at the API documentation [`/docs`]() after launching the application.**

In order to follow along, keep the database model below in mind:

![database model](db-model.png)

### Start off with creating a new location where you will place the sensor station

The first thing you need to do is to create a new location. This is done by making a POST request to the `/locations`
endpoint. In this example, I will create a new location for `Gräsvik`.

```sh
POST: /api/<api_version>/locations
JSON BODY:
{
	"location_name": "Trossö",
	"lat": 56.160820,
	"long": 15.586710,
	"rad": 1000
}

Using curl (assuming running the application locally):
$ curl --request POST \
  --url http://localhost:3000/api/<api_version>/locations \
  --header 'Content-Type: application/json' \
  --data '{
	"location_name": "Trossö",
	"lat": 56.160820,
	"long": 15.586710,
	"rad": 1000
}'
```

The endpoint returns the id of the location (lets assume it returned `1`). You will need this later when linking your
sensor station to this location.

### Register your sensors

The sensors are the individual devices that will be used to collect data of a certain type, for example a thermometer.
The following POST request to the `/sensors` endpoint will create a new sensor, which I will name `rkz1000` (perhaps its
model number) and it runs firmware `1.3.1`

```sh
POST: /api/<api_version>/sensors
JSON BODY:
{
    "sensor_name": "rkz1000",
    "firmware": "1.3.1",
    "location_id": 1
}

Using curl (again, assuming running the application locally):
$ curl --request POST \
  --url http://localhost:3000/api/<api_version>/sensors \
  --header 'Content-Type: application/json' \
  --data '{
	"type": "temperature",
	"name": "rkz1000",
	"firmware": "1.3.1"
}'
```

The endpoint returns the id (lets assume it returned `1`) of the sensor. You will need this in the next step when
linking the sensor to a station.

### Link your sensors to your location with a sensor station

A sensor station is a collection of sensors that are placed in a location. The following POST request will create a new
station with the sensor we just created. I will also place the station in the location we created earlier.

```sh
POST: /api/<api_version>/stations
JSON BODY:
{
    "station_name": "rkz1000",
    "location_id": 1,
    "sensor_ids": [1]
}

Using curl (again, assuming running the application locally):
$ curl --request POST \
  --url http://localhost:3000/api/<api_version>/stations \
  --header 'Content-Type: application/json' \
  --data '{
    "station_name": "rkz1000",
    "location_id": 1,
    "sensor_ids": [1]
}'
```

### Upload measurements

Now that we have a sensor station, we can upload measurements from it. The following POST request will upload a
measurement of `23.5°C`.

```sh
POST: /api/<api_version>/measurements
JSON BODY:
{
    "timestamp": "2022-04-08T14:08:54+02",
    "location_id": 1,
    "sensors": [
        { "sensor_id": 1, "value": 23.5, "unit": "c" }
    ]
}

Using curl (again, assuming running the application locally):
$ curl --request POST \
  --url http://localhost:3000/api/v2/measurements \
  --header 'Content-Type: application/json' \
  --data '{
	"timestamp": "2022-04-08T14:08:54+02",
	"location_id": 1,
	"sensors": [
		{"sensor_id": 1, "value": 23.5, "unit": "c"}
	]
}'
```

That's it! You can now see the data in the database. This query can be used to continuously upload data from your
sensor. If you have multiple sensors at the same station, lets say a conductivity sensor which measures total dissolved
solids, just specify multiple sensors in the `sensor_ids` field:

```json
{
  "timestamp": "2022-04-08T14:08:54+02",
  "location_id": 1,
  "sensors": [
    {
      "sensor_id": 1,
      "value": 23.5,
      "unit": "c"
    },
    {
      "sensor_id": 2,
      "value": 40000,
      "unit": "ppm"
    }
  ]
}
```
