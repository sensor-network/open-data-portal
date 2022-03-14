import useSWR from 'swr';
import {useContext, useMemo} from 'react';
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

export async function getServerSideProps(context){
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
}

export default function App(props){
    const initialData = props.initialData;
    const preferences = useContext(PreferenceContext);

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
        conductunit: preferences.conductivity_unit.symbol
    });

    const options = {fetcher: () => fetcher(url),
                    fallbackData: initialData,
                    refreshInterval: 1000 * 60};
    const { data, error } = useSWR(url, options);

    if (error) return <div>failed to load</div>;
    if (!data) return <div>loading...</div>; /* Is this needed since there is already data? */

    return(
        <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>
                <div style={{ width: '95%', maxWidth: 1000}}>
                    <h2>Explore the data on your own</h2>
                    <p>Change the units using the preference modal form the navbar. </p>
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
                    <p>Select what datapoints you want to display in the grid using the checkboxes</p>
                </div>

                <CustomAreaChart data={data}/>
            </div>
        </>
    );
}

