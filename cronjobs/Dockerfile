FROM alpine

# Install curl to send http-requests
RUN apk update && apk add curl

# Define and enable crontab to use
COPY crontab /etc/crontabs/root
COPY jobs /jobs
RUN crontab /etc/crontabs/root

# Start cron daemon on container startup
CMD ["crond", "-f"]
