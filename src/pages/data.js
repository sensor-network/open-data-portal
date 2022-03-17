import * as date_fns from "date-fns";
import useSWR from 'swr';
import {useContext, useState} from 'react';
import { PreferenceContext } from './_app';
import {loadPreferences} from '../lib/loadPreferences.ts';
import CustomAreaChart from "src/components/CustomAreaChart";
import CustomDataGrid from "src/components/CustomDataGrid";

const fetcher = (url) => fetch(url).then(res => res.json());
const endpointUrl = "http://localhost:3000/api/v2/data?";

function urlWithParams(url, params){
    //A function that adds the given parameters to the given URL, params can be a string or an object for example.
    return url + new URLSearchParams(params);
}

export async function getServerSideProps(context){
    //Since useContext(PreferenceContext) cannot be used:
    const preferences = loadPreferences(context.req.cookies.preferences);

    let url = urlWithParams(endpointUrl, {
        temperature_unit: preferences.temperature_unit.symbol,
        conductivity_unit: preferences.conductivity_unit.symbol,
        name: preferences.location.symbol,
    });
    const data = await fetcher(url);
    
    return{
        props: {
            initialData: data
        }
    }
}

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

export default function App({ initialData }){
    const { preferences } = useContext(PreferenceContext);

    /* define how long period should show */
    const [dateRange, setDateRange] = useState(() => {
        const range = dateRanges[1]; // 1 week
        range.active = true;
        return range;
    });

    let url = urlWithParams(endpointUrl, {
        temperature_unit: preferences.temperature_unit.symbol,
        conductivity_unit: preferences.conductivity_unit.symbol,
        location_name: preferences.location.symbol,
        start_date: dateRange.startDate.toISOString(),
        page_size: 2000,
    });

    const swrOptions = {
        fetcher: () => fetcher(url),
        fallbackData: initialData,
        refreshInterval: 1000 * 60
    }
    /* incoming response { pagination: {}, data: [] } */
    let { data: { data }, error } = useSWR(url, swrOptions);
    if (error) return <div>failed to load</div>;
    return(
        <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>
                <div style={{ width: '95%', maxWidth: 1000}}>
                    <h2>Explore the data on your own</h2>
                    <p>Change the units using the preference modal from the navbar. </p>
                </div>
                <CustomDataGrid data={data} preferences={preferences}/>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>

                <div style={{ width: '95%', maxWidth: 1000}}>
                    <h2>See how the data has changed over time</h2>
                    <h3 style={{marginTop: 3, marginBottom: 3}}>Show data for:</h3>

                    <div style={{display: 'flex'}}>
                        {dateRanges.map((r, idx) => (
                            <div key={idx}
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

