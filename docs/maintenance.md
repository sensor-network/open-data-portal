# Maintenance

## Docker

The system comes packaged into three docker containers

### Cronjobs

A minimal, 10MB, Alpine container with `curl`, built locally from [this Dockerfile](/cronjobs/Dockerfile). You can define the jobs in [crontab](/cronjobs/crontab).

Currently, this container sends an API request to [`/api/private/aggregate-daily`](/src/pages/api/private/aggregate-daily.ts) everyday at midnight UTC. This endpoint handles all the logic to aggrregate the data that has come in during the day and inserts it into the `history` table.

The cronjobs are logged in `cronjobs/logs`, grouped monthly. A log entry can look like this:

```sh
# cronjobs/logs/aggregate-2022-04.log
2022-04-07 - [daily aggregation] - Status: 200
2022-04-08 - [daily aggregation] - Status: 200
```

If you see any other status than 200, it means something went wrong for that days aggregation. You can then query the endpoint manually. The endpoint takes 1 argument, the day for which you want to aggregate the data for, defined in the `date` query parameter. You are also required to authenticate yourself using a `Bearer token` in the `Authorization` header. The `api/private/***` uses the `PRIVATE_API_KEY`, defined in the [compose-file](/docker-compose.yml) under `NEXT_PUBLIC_PRIVATE_API_KEY`, as token.

**NOTE: When you change the token in the compose-file. Also change it in the [curl-job](/cronjobs/jobs/aggregate-daily.sh). The token is currently hard-coded in there. Otherwise, the job will fail to authenticate.**

### App
