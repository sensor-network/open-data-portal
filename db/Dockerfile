FROM --platform=linux/x86_64/v8 mysql:8

# Use init-scripts from ./init
COPY ./init /docker-entrypoint-initdb.d/:ro

