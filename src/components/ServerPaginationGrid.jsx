import { useContext, useMemo, useState } from "react";
import { PreferenceContext } from "../pages/_app";
import useSWR from "swr";
import { DataGrid } from "@mui/x-data-grid";

const endpoint = "http://localhost:3000/api/v2/data?";
const urlWithParams = (baseUrl, params) => baseUrl + new URLSearchParams(params);
const fetcher = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

const ServerPaginationGrid = () => {
  const [rowsState, setRowsState] = useState({
    page: 0,
    pageSize: 20,
  });

  const { preferences } = useContext(PreferenceContext);
  const url = useMemo(() => urlWithParams(endpoint, {
    temperature_unit: preferences.temperature_unit.symbol,
    conductivity_unit: preferences.conductivity_unit.symbol,
    page: rowsState.page + 1,
    page_size: rowsState.pageSize,
  }), [preferences, rowsState]);

  const { data, isLoading } = useSWR(url, {
    fetcher: () => fetcher(url),
    fallbackData: { pagination: { total_rows: 0 }, data: [] },
    refreshInterval: 1000 * 60,
  });
  const rows = data.data;
  const rowCount = data.pagination.total_rows;


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
        rows={rows}
        columns={gridColumns}
        rowCount={rowCount}
        loading={isLoading}
        pagination
        paginationMode={"server"}
        page={rowsState.page}
        pageSize={rowsState.pageSize}
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        onPageChange={(page) => setRowsState((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) => setRowsState((prev) => ({ ...prev, pageSize }))}
      />
    </div>
  );
};

export default ServerPaginationGrid;
