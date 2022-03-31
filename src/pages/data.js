import useSWR from "swr";
import { useContext, useState } from "react";

import Container from "@mui/material/Container";

import { PreferenceContext } from "./_app";
import { loadPreferences } from "src/lib/loadPreferences.ts";

import CustomAreaChart from "src/components/CustomAreaChart";
import ServerPaginationGrid from "src/components/ServerPaginationGrid";
import Visualization from "src/components/Visualization";
import CustomDataGrid from "src/components/CustomDataGrid";
import Summary from "src/components/Summary";

const fetcher = (url) => fetch(url).then(res => res.json());
const endpointUrl = "http://localhost:3000/api/v2/data?";

function urlWithParams(url, params) {
  //A function that adds the given parameters to the given URL, params can be a string or an object for example.
  return url + new URLSearchParams(params);
}

export default function App() {
  const { preferences } = useContext(PreferenceContext);

  let url = urlWithParams(endpointUrl, {
    temperature_unit: preferences.temperature_unit.symbol,
    conductivity_unit: preferences.conductivity_unit.symbol,
    location_name: preferences.location.symbol,
    page_size: 2000,
  });

  const swrOptions = {
    fetcher: () => fetcher(url),
    fallbackData: { pagination: {}, data: [] },
    refreshInterval: 1000 * 60,
  };
  
  /* incoming response { pagination: {}, data: [] } */
  let { data: { data }, error } = useSWR(url, swrOptions);
  if (error) return <div>failed to load</div>;
  return (
    <Container style={{ display: "flex", flexDirection: "column", gap: 50, marginBottom: 50 }} maxWidth={"xl"}>
      {/* TODO: Bring out data-grid to separate component */}
      <div style={{ width: "95%", maxWidth: 1000 }}>
        <h2>Explore the data on your own</h2>
        <p>Change the units using the preference modal from the navbar. </p>
        <ServerPaginationGrid /> 
      </div>

      <Summary/>

      <Visualization data={data}/>
    </Container>
  );
}

