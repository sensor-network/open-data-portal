import useSWR from 'swr';
import {useContext} from 'react';
import { PreferenceContext } from './_app';
import {loadPreferences} from '../lib/loadPreferences.ts'

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

function App(props){
    const initialData = props.initialData;
    const preferences = useContext(PreferenceContext);

    const params = {
        tempunit: preferences.temperature_unit.symbol,
        conductunit: preferences.conductivity_unit.symbol
    };

    let url = urlWithParams(endpointUrl, params);

    const options = {fetcher: () => fetcher(url),
                    fallbackData: initialData,
                    refreshInterval: 1000 * 60};
    const { data, error } = useSWR(url, options);

    if (error) return <div>failed to load</div>;
    if (!data) return <div>loading...</div>;//Is this needed since there is already data?
    
    return <div>
        {data.map( (row) => (
            <div key= {row.id}>
                {row.id} {row.pH} {row.temperature} {row.conductivity} {row.date} {row.longitude} {row.latitude}
            </div>
      ))}</div>;
}

export default App;