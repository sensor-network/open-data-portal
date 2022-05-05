import { useEffect, useState } from "react";
import { fetcher } from "~/lib/utils/fetch";
import type { Location } from "~/lib/database/location";

export const useLocations = (url: string) => {
  const [locations, setLocations] = useState<Array<Location> | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locations: Location[] = await fetcher(url);
        setLocations(locations);
      } catch (e) {
        console.error(`useLocations::`, e);
        setLocations([]);
      }
    };
    fetchLocations();
  }, [url]);

  return locations;
};
