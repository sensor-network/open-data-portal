export function timestampToUTC(timestamp, offset) {
    // Converts the timestamp to UTC and returns it as a string formatted like "YYYY-MM-DD HH:MM:SS"
    let dateInUTC;
    if (offset < 0)
        dateInUTC = new Date(`${timestamp}-${-offset}`);
    else
        dateInUTC = new Date(`${timestamp}+${offset}`);

    // ISO string will be formatted like `YYYY:MM:DDTHH:MM:SS.XXXZ`. Extract ["YYYY:MM:DD" and "HH:MM:SS"]
    let dateString = dateInUTC.toISOString().split('T')[0];
    let timeString = dateInUTC.toISOString().split('T')[1].split(".")[0];

    return dateString + " " + timeString;
}

// TODO: Currently only supports input format "YYYY-MM-DD:HH:mm:ss"