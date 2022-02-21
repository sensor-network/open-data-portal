FROM --platform=linux/x86_64/v8 mysql:8
# Create a database
ENV MYSQL_DATABASE sensor_network
# Use init-scripts from ./init
COPY ./init/ /docker-entrypoint-initdb.d/

