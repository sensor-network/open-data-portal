import { useContext, useMemo, useState } from "react";
import { formatISO } from "date-fns";
import {
  DataGrid,
  GridToolbarExport,
  GridToolbarContainer,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { CardContent } from "@mui/material";

import { useMeasurements, useSensorTypes } from "~/lib/hooks";
import {
  PreferenceContext,
  getPreferredUnitSymbol,
} from "~/lib/utils/preferences";
import { urlWithParams } from "~/lib/utils/fetch";
import capitalize from "~/lib/utils/capitalize";
import { round } from "~/lib/utils/math";
import { CustomProgressBar } from "./CustomProgressBar";
import CustomPagination from "./GridPagination";
import Card from "./Card";
import DateRangeSelector from "./DateRangeSelector";

const ENDPOINT = "/api/v3/measurements?";

function MyExportButton() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

const ServerPaginationGrid: React.FC = () => {
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
        valueGetter: (time: GridValueGetterParams) =>
          new Date(time.value).toLocaleString(),
      },
      {
        field: "locationName",
        width: 150,
        headerName: "Location Name",
        valueGetter: (measurement: GridValueGetterParams) =>
          measurement.row.locationName,
      },
      {
        field: "longitude",
        headerName: "Longitude",
        width: 120,
        valueGetter: (measurement: GridValueGetterParams) =>
          round(measurement.row.position.long, 6),
      },
      {
        field: "latitude",
        headerName: "Latitude",
        width: 120,
        valueGetter: (measurement: GridValueGetterParams) =>
          round(measurement.row.position.lat, 6),
      },
    ];
    const sensorColumns = sensorTypes?.map((sensor) => {
      const unitKey = sensor + "Unit";
      const unit = getPreferredUnitSymbol(unitKey, preferences);
      const header = unit
        ? `${capitalize(sensor)} (${capitalize(unit)})`
        : sensor === "ph"
        ? "pH"
        : capitalize(sensor);
      return {
        field: sensor,
        headerName: header,
        width: 150,
        valueGetter: (measurement: GridValueGetterParams) =>
          measurement.row.sensors[sensor],
      };
    });
    if (sensorColumns) {
      columns.push(...sensorColumns);
    }
    return columns;
  }, [sensorTypes, preferences]);

  return (
    <Card title="Explore the data on your own">
      <CardContent style={{ height: 750 }}>
        {isLoading ? (
          <CustomProgressBar />
        ) : error || !measurements ? (
          <div>No data found</div>
        ) : (
          <DataGrid
            rows={measurements}
            columns={gridColumns}
            rowCount={pagination?.totalRows}
            loading={isLagging || isLoading}
            getRowId={(row) =>
              new Date(row.time).getTime() *
              row.position.lat *
              row.position.long
            }
            components={{
              LoadingOverlay: CustomProgressBar,
              Pagination: () => <CustomPagination setPage={setPage} />,
              Toolbar: MyExportButton,
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
      </CardContent>

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
