import { useContext, useMemo, useState } from "react";

import Pagination from "@mui/material/Pagination";
import {
  DataGrid,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
  GridToolbarExport,
  GridToolbarContainer
} from "@mui/x-data-grid";
import { ThemeProvider } from "@mui/material/styles";
import { theme, CustomProgressBar } from "./CustomProgressBar";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "src/components/Card";
import DateRangeSelector from "src/components/DateRangeSelector";
import { useSensorTypes } from "src/lib/hooks/useSensorTypes";
import { useMeasurements } from "../lib/hooks/swr-extensions";
import { PreferenceContext } from "../pages/_app";
import { urlWithParams, capitalize, round } from "../lib/utilityFunctions";
import { formatISO } from "date-fns";

const ENDPOINT = "/api/v3/measurements?";

function MyExportButton() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}
  

const ServerPaginationGrid = () => {
  /* Define pagination options, which can be modified in the grid */
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  /* Define date range, which can be modified in the date range selector */
  const [startDate, setStartDate] = useState(new Date(1));
  const [endDate, setEndDate] = useState(new Date());

  /* Get correct url for fetching the filtered data */
  const { preferences } = useContext(PreferenceContext);
  const url = useMemo(
    () =>
      urlWithParams(ENDPOINT, {
        temperatureUnit: preferences.temperatureUnit.symbol,
        conductivityUnit: preferences.conductivityUnit.symbol,
        locationName: preferences.location.symbol,
        page: page + 1 /* mui grid starts indexing at 0, api at 1 */,
        pageSize: pageSize,
        startTime: formatISO(startDate),
        endTime: formatISO(endDate),
      }),
    [preferences, page, pageSize, startDate, endDate]
  );

  const { measurements, pagination, isLoading, isLagging, error } =
    useMeasurements(url);

  const sensorTypes = useSensorTypes("/api/v3/sensors/types");

  const gridColumns = useMemo(() => {
    const columns = [
      {
        field: "time",
        width: 180,
        headerName: `Time (${Intl.DateTimeFormat().resolvedOptions().locale})`,
        valueGetter: (time) => new Date(time.value).toLocaleString(),
      },
      {
        field: "locationName",
        width: 150,
        headerName: "Location Name",
        valueGetter: (measurement) => measurement.row.locationName,
      },
      {
        field: "longitude",
        headerName: "Longitude",
        width: 120,
        valueGetter: (measurement) => round(measurement.row.position.long, 6),
      },
      {
        field: "latitude",
        headerName: "Latitude",
        width: 120,
        valueGetter: (measurement) => round(measurement.row.position.lat, 6),
      },
    ];
    const sensorColumns = sensorTypes?.map((sensor) => {
      const unit = preferences[`${sensor}Unit`]?.symbol;
      const header = unit
        ? `${capitalize(sensor)} (${capitalize(unit)})`
        : sensor === "ph"
        ? "pH"
        : capitalize(sensor);
      return {
        field: sensor,
        headerName: header,
        width: 150,
        valueGetter: (measurement) => measurement.row.sensors[sensor],
      };
    });
    if (sensorColumns) {
      columns.push(...sensorColumns);
    }
    return columns;
  }, [sensorTypes, preferences]);

  const CustomPagination = () => {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    const [textFieldValue, setTextFieldValue] = useState(page + 1);
    const validateInput = () => {
      const value = parseInt(textFieldValue, 10);
      if (!isNaN(value) && value > 0) {
        setPage(value - 1);
      }
    };

    return (
      <div
        style={{
          width: "100%",
          right: 0,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <ThemeProvider theme={theme}>
          <Pagination
            color="primary"
            count={pageCount}
            page={page + 1}
            onChange={(event, value) => apiRef.current.setPage(value - 1)}
          />
          <TextField
            size="small"
            label="Page"
            value={textFieldValue}
            onChange={(e) => setTextFieldValue(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={validateInput}>
            Go To
          </Button>
        </ThemeProvider>
      </div>
    );
  };

  return (
    <Card
      title="Explore the data on your own"
      styles={{ margin: "40px 0 0 0" }}
    >
      <div style={{ height: 750, margin: "20px 0" }}>
        {isLoading ? (
          <CustomProgressBar />
        ) : error ? (
          <div>No data found</div>
        ) : (
          <DataGrid
            rows={measurements}
            columns={gridColumns}
            rowCount={pagination?.totalRows}
            loading={isLagging || isLoading}
            getRowId={(row) => row.time}
            components={{
              LoadingOverlay: CustomProgressBar,
              Pagination: CustomPagination,
              Toolbar: MyExportButton
            }}
            pagination
            paginationMode={"server"}
            page={page}
            pageSize={pageSize}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            onPageChange={(page) => setPage(page)}
            onPageSizeChange={(pageSize) => setPageSize(pageSize)}
          />
        )}
      </div>

      <div>
        <DateRangeSelector
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </div>
    </Card>
  );
};

export default ServerPaginationGrid;
