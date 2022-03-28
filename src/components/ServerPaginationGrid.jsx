import { useContext, useMemo, useState } from "react";
import useSWR from "swr";
import { DataGrid } from "@mui/x-data-grid";
import LinearProgress from "@mui/material/LinearProgress";

import { laggy } from "../lib/hooks/swr-extensions";
import { PreferenceContext } from "../pages/_app";

const endpoint = "http://localhost:3000/api/v2/data?";
const urlWithParams = (baseUrl, params) => baseUrl + new URLSearchParams(params);
const fetcher = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

/* Wrapper for SWR using 'laggy' data */
const useMeasurements = (url) => {
  const { data, isLagging } = useSWR(url, {
    fetcher: () => fetcher(url),
    use: [laggy],
  });
  return {
    measurements: data?.data,
    rowCount: data?.pagination.total_rows,
    isLoading: isLagging,
  };
};


const ServerPaginationGrid = () => {
  /* Define pagination options, which can be modified in the grid */
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  /* Get correct url for fetching the filtered data */
  const { preferences } = useContext(PreferenceContext);
  const url = useMemo(() => urlWithParams(endpoint, {
    temperature_unit: preferences.temperature_unit.symbol,
    conductivity_unit: preferences.conductivity_unit.symbol,
    location_name: preferences.location.symbol,
    page: page + 1, /* mui grid starts indexing at 0, api at 1 */
    page_size: pageSize,
  }), [preferences, page, pageSize]);

  const { measurements, rowCount, isLoading } = useMeasurements(url);

  const gridColumns = useMemo(() => [
    { field: "id", headerName: "ID", width: 70, editable: false },
    { field: "ph", headerName: "pH", width: 90, editable: false },
    {
      field: "temperature",
      headerName: `Temperature (${preferences.temperature_unit.symbol})`,
      width: 150,
      editable: false,
    },
    {
      field: "conductivity",
      headerName: `Conductivity (${preferences.conductivity_unit.symbol})`,
      width: 150,
      editable: false,
    },
    {
      field: "date", width: 200, editable: false,
      headerName: `Date (${Intl.DateTimeFormat().resolvedOptions().locale})`,
      valueGetter: date => new Date(date.value).toLocaleString(),
    },
    { field: "longitude", headerName: "Longitude", width: 150, editable: false },
    { field: "latitude", headerName: "Latitude", width: 150, editable: false },
  ], [preferences]);

  return (
    <div style={{ height: 750, width: "95%", maxWidth: 1000 }}>
      <DataGrid
        rows={measurements}
        columns={gridColumns}
        rowCount={rowCount}
        loading={isLoading}
        components={{ LoadingOverlay: LinearProgress }}
        pagination
        paginationMode={"server"}
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        onPageChange={page => setPage(page)}
        onPageSizeChange={pageSize => setPageSize(pageSize)}
      />
    </div>
  );
};

export default ServerPaginationGrid;
