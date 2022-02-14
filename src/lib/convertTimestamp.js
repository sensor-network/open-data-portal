
export default function (timestamp, offset) {
    console.log("timestamp", timestamp)
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