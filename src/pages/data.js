import * as date_fns from "date-fns";
import useSWR from 'swr';
import {useContext, useMemo, useState} from 'react';
import { PreferenceContext } from './_app';
import {loadPreferences} from '../lib/loadPreferences.ts';
import { DataGrid } from '@mui/x-data-grid'; //Documentation can be found here: https://mui.com/components/data-grid/

import CustomAreaChart from "src/components/CustomAreaChart";

const fetcher = (url) => fetch(url).then(res => res.json());
const endpointUrl = "http://localhost:3000/api/v1?";

function urlWithParams(url, params){
    //A function that adds the given parameters to the given URL, params can be a string or an object for example.
    return url + new URLSearchParams(params);
}

/*export async function getServerSideProps(context){
    //Since useContext(PreferenceContext) cannot be used:
    const preferences = loadPreferences(context.req.cookies.preferences);
    
    const params = {
        tempunit: preferences.temperature_unit.symbol,
        conductunit: preferences.conductivity_unit.symbol
    };

    let url = urlWithParams(endpointUrl, params);
    const data = await fetcher(url);
    
    return{
        props: {
            initialData: data
        }
    }
}*/

const dateRanges = [
    { label: 'today',     active: false, startDate: date_fns.startOfDay(new Date()),                density: 1 },
    { label: '1 week',    active: false, startDate: date_fns.sub(new Date(), {weeks: 1}),   density: 10 },
    { label: '1 month',   active: false,  startDate: date_fns.sub(new Date(), {months: 1}), density: 30 },
    { label: '3 months',  active: false, startDate: date_fns.sub(new Date(), {months: 3}),  density: 60 },
    { label: 'this year', active: false, startDate: date_fns.startOfYear(new Date()),               density: 60 * 3 },
    { label: '1 year',    active: false, startDate: date_fns.sub(new Date(), {years: 1}),   density: 60 * 3 },
    { label: '3 years',   active: false, startDate: date_fns.sub(new Date(), {years: 3}),   density: 60 * 12 },
    { label: 'Max',       active: false, startDate: new Date(0),                              density: 60 * 12 },
];

export default function App(props){
    //const initialData = props.initialData;
    const preferences = useContext(PreferenceContext);

    /* define how long period should show */
    const [dateRange, setDateRange] = useState(() => {
        const range = dateRanges[1]; // 1 week
        range.active = true;
        return range;
    });
    /* define time in seconds between measurements */
    const [dataDensity, setDataDensity] = useState(10 * 60);

    const gridColumns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 70, editable: false },
        { field: 'pH', headerName: 'pH', width: 90, editable: false },
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

    let url = urlWithParams(endpointUrl, {
        tempunit: preferences.temperature_unit.symbol,
        conductunit: preferences.conductivity_unit.symbol,
        start_date: dateRange.startDate.toISOString(),
    });

    const options = {fetcher: () => fetcher(url),
                    fallbackData: [],
                    refreshInterval: 1000 * 60};
    const { data, error } = useSWR(url, options);

    if (error) return <div>failed to load</div>;
    if (!data) return <div>loading...</div>; /* Is this needed since there is already data? */

    return(
        <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>
                <div style={{ width: '95%', maxWidth: 1000}}>
                    <h2>Explore the data on your own</h2>
                    <p>Change the units using the preference modal from the navbar. </p>
                </div>
                <div style={{ height: 750, width: '95%', maxWidth: 1000 }}>
                    <DataGrid
                        rows= {data}
                        columns= {gridColumns}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>

                <div style={{ width: '95%', maxWidth: 1000}}>
                    <h2>See how the data has changed over time</h2>
                    <h3 style={{marginTop: 3, marginBottom: 3}}>Show data for:</h3>

                    <div style={{display: 'flex'}}>
                        {dateRanges.map((r) => (
                            <div
                                style={{padding: '5px 0', marginRight: 15, borderBottom: r.active ? '3px solid #1565c0' : ''}}
                                onClick={() => {
                                    setDateRange(prevRange => {
                                        prevRange.active = false;
                                        r.active = true;
                                        return r;
                                    });
                                }}
                            >
                                <p style={{color: '#1565c0', padding: 0, margin: 0, cursor: 'pointer'}}>{r.label}</p>
                            </div>
                        ))}
                    </div>

                    <h3 style={{marginBottom: 0}}>Select data to show:</h3>
                </div>

                <CustomAreaChart data={data}/>
            </div>
        </>
    );
}

