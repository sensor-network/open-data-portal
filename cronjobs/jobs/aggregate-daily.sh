#!/usr/bin/env sh
# Script for aggregating the data for the day. Runs in silent mode and outputs a custom log to a monthly logfile.

# 1 day = 86400 seconds
YESTERDAY=$(date -d "@$(($(date +%s) - 86400))" +"%Y-%m-%d")

# Options for the request (this job is triggered at midnight, hence aggregate yesterdays data)
URL="app:3000/api/private/aggregate-daily?date=$YESTERDAY"
# URL="http://localhost:3000/api/private/aggregate-daily"
HEADERS="Authorization: Bearer default"

# Options for logging
LOG_FILE="/var/log/aggregate-$(date +"%Y-%m").log"
LOG_INFORMATION="$YESTERDAY - [daily aggregation] - Status: %{response_code}\n"

# Execute command
curl "$URL" -X 'POST' --header "$HEADERS" -w "$LOG_INFORMATION" >> "$LOG_FILE" -o /dev/null -s