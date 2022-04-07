import { useEffect, useState } from 'react';
import type { Location } from 'src/lib/database/location';

export const useLocations = (url: string) => {
  const [locations, setLocations] = useState<Array<Location> | undefined>(undefined);

  useEffect(() => {
    const fetchLocations = async () => {
      const res = await fetch(url);
      const locations: Array<Location> = await res.json();
      setLocations(locations);
    };
    fetchLocations();
  }, [url]);

  return locations;
};
