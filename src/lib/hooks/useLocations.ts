import {useEffect, useState} from 'react';

export const useLocations = (url: string) => {
    const [locations, setLocations] = useState();

    useEffect(() => {
        const fetchLocations = async () => {
            const res = await fetch(url);
            const locations = await res.json();
            setLocations(locations);
        }
        fetchLocations();
    }, []);

    return locations;
}
