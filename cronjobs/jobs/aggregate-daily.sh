#!/usr/bin/env sh
# Script for aggregating the data for the day. Runs in silent mode and outputs a custom log to a monthly logfile.

# Options for the request (this job is triggered at midnight, hence aggregate yesterdays data)
YESTERDAY=$(date --date="yesterday" +"%Y-%m-%d")
URL="app:3000/api/private/aggregate-daily?date=$YESTERDAY"
# URL="http://localhost:3000/api/private/aggregate-daily"
HEADERS="Authorization: Basic default"

# Options for logging
LOG_FILE="/var/log/aggregate-$(date +"%Y-%m").log"
LOG_INFORMATION="$YESTERDAY - [daily aggregation] - Status: %{response_code}\n"

# Execute command
curl "$URL" -X 'POST' --header "$HEADERS" -w "$LOG_INFORMATION" >> "$LOG_FILE" -o /dev/null -s