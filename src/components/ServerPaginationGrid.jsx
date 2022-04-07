import { useContext, useMemo, useState } from "react";

import Pagination from "@mui/material/Pagination";
import {
  DataGrid, gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Card from "src/components/Card";
import DateRangeSelector from "src/components/DateRangeSelector";
import { useSensorTypes } from "src/lib/hooks/useSensorTypes";
import { useMeasurements } from "../lib/hooks/swr-extensions";
import { PreferenceContext } from "../pages/_app";
import { urlWithParams, capitalize } from "../lib/utilityFunctions";
import { formatISO } from "date-fns";

const ENDPOINT = "http://localhost:3000/api/v2/measurements?";

const ServerPaginationGrid = () => {
  /* Define pagination options, which can be modified in the grid */
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  /* Define date range, which can be modified in the date range selector */
  const [startDate, setStartDate] = useState(new Date(1));
  const [endDate, setEndDate] = useState(new Date());

  /* Get correct url for fetching the filtered data */
  const { preferences } = useContext(PreferenceContext);
  const url = useMemo(() => urlWithParams(ENDPOINT, {
    temperature_unit: preferences.temperature_unit.symbol,
    conductivity_unit: preferences.conductivity_unit.symbol,
    location_name: preferences.location.symbol,
    page: page + 1, /* mui grid starts indexing at 0, api at 1 */
    page_size: pageSize,
    start_date: formatISO(startDate),
    end_date: formatISO(endDate),
  }), [preferences, page, pageSize, startDate, endDate]);

  const { measurements, pagination, isLoading, isLagging } = useMeasurements(url);

  const sensorTypes = useSensorTypes("/api/v2/sensors/types");

  const gridColumns = useMemo(() => {
    const columns = [
      {
        field: "time", width: 200,
        headerName: `Time (${Intl.DateTimeFormat().resolvedOptions().locale})`,
        valueGetter: time => new Date(time.value).toLocaleString(),
      },
      {
        field: "location_name",
        width: 200,
        headerName: "Location Name",
        valueGetter: (measurement) => measurement.row.location_name,
      },
      {
        field: "longitude",
        headerName: "Longitude",
        width: 150,
        valueGetter: (measurement) => measurement.row.position.long,
      },
      {
        field: "latitude",
        headerName: "Latitude",
        width: 150,
        valueGetter: (measurement) => measurement.row.position.lat,
      },
    ];
    const sensorColumns = sensorTypes?.map(sensor => {
      const unit = preferences[`${sensor}_unit`]?.symbol;
      const header = unit ? `${capitalize(sensor)} (${capitalize(unit)})` :
        sensor === "ph" ? "pH" :
          capitalize(sensor);
      return {
        field: sensor, headerName: header, width: 150,
        valueGetter: (measurement) => measurement.row.sensors[sensor],
      };
    });
    if (sensorColumns) {
      columns.push(...sensorColumns);
    }
    return columns;
  }, [sensorTypes, preferences]);

  const CustomPagination = () => {
    const [textFieldValue, setTextFieldValue] = useState(`${page + 1}`);
    const [valid, setValid] = useState(true);
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    const validateInput = () => {
      const value = parseInt(textFieldValue, 10);
      if (value < 1 || isNaN(value)) {
        setValid(false);
      }
      else {
        setPage(value);
      }
    };
    return (
      <div style={{ display: "flex", alignItems: "center", marginLeft: 650, justifyContent: "flex-end" }}>
        <TextField value={textFieldValue} onChange={e => setTextFieldValue(e.target.value)}/>
        <Button onClick={validateInput}>Select</Button>
        <Pagination
          color="primary"
          style={{ width: 5000 }}
          count={pageCount}
          page={page + 1}
          onChange={(event, value) => apiRef.current.setPage(value - 1)}
        />
      </div>
    );
  };
  return (
    <Card title="Explore the data on your own" margin="40px 0 0 0">
      <div style={{ height: 750, margin: "20px 0" }}>
        {isLoading ? <LinearProgress/> : <DataGrid
          rows={measurements}
          columns={gridColumns}
          rowCount={pagination?.total_rows}
          loading={isLagging || isLoading}
          getRowId={row => row.time}
          components={{ LoadingOverlay: LinearProgress, Pagination: CustomPagination }}
          pagination
          paginationMode={"server"}
          page={page}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          onPageChange={page => setPage(page)}
          onPageSizeChange={pageSize => setPageSize(pageSize)}
        />}
      </div>

      <div>
        <DateRangeSelector
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
        />
      </div>

    </Card>

  );
};

export default ServerPaginationGrid;
