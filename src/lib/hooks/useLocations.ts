import { useEffect, useState } from 'react';
import { fetcher } from "src/lib/utilityFunctions";
import type { Location } from 'src/lib/database/location';

export const useLocations = (url: string) => {
  const [locations, setLocations] = useState<Array<Location> | undefined>(undefined);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locations: Location[] = await fetcher(url);
        setLocations(locations);
      }
      catch (e) {
        console.error(`useLocations::`, e);
        setLocations([]);
      }
    };
    fetchLocations();
  }, [url]);

  return locations;
};
