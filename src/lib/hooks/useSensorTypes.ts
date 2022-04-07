import { useEffect, useState } from 'react';

export const useSensorTypes = (url: string) => {
  const [sensorTypes, setSensorTypes] = useState<Array<string> | undefined>(undefined);

  useEffect(() => {
    const fetchSensorTypes = async () => {
      const res = await fetch(url);
      const sensorTypes: Array<string> = await res.json();
      setSensorTypes(sensorTypes);
    };
    fetchSensorTypes();
  }, [url]);

  return sensorTypes;
};
