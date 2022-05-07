import { useEffect, useState } from "react";
import { fetcher } from "~/lib/utils/fetch";

export const useSensorTypes = (url: string) => {
  const [sensorTypes, setSensorTypes] = useState<Array<string> | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchSensorTypes = async () => {
      try {
        const types: string[] = await fetcher(url);
        setSensorTypes(types);
      } catch (e) {
        console.error(`useSensorTypes::`, e);
        setSensorTypes([]);
      }
    };
    fetchSensorTypes();
  }, [url]);

  return sensorTypes;
};
