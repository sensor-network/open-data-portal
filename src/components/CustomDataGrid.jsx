import { DataGrid } from '@mui/x-data-grid'; //Documentation can be found here: https://mui.com/components/data-grid/
import {useMemo} from "react";

const CustomDataGrid = ({ data, preferences }) => {
    const gridColumns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 70, editable: false },
        { field: 'ph', headerName: 'pH', width: 90, editable: false },
        { field: 'temperature', headerName: `Temperature (${preferences.temperature_unit.symbol})`, width: 150, editable: false },
        { field: 'conductivity', headerName: `Conductivity (${preferences.conductivity_unit.symbol})`, width: 150, editable: false },
        {
            field: 'date', width: 200, editable: false,
            headerName: `Date (${Intl.DateTimeFormat().resolvedOptions().locale})`,
            valueGetter: date => new Date(date.value).toLocaleString()
        },
        { field: 'longitude', headerName: 'Longitude', width: 150, editable: false },
        { field: 'latitude', headerName: 'Latitude', width: 150, editable: false }
    ], [preferences]);

    return (
        <div style={{ height: 750, width: '95%', maxWidth: 1000 }}>
            <DataGrid
                rows= {data}
                columns= {gridColumns}
            />
        </div>
    );
}

export default CustomDataGrid;
