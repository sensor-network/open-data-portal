export default function (timestamp, offset) {
    if (offset < 0)
        return new Date(`${timestamp}-${-offset}`);
    return new Date(`${timestamp}+${offset}`);
}

// TODO: Currently only supports input format "YYYY-MM-DD:HH:mm:ss"