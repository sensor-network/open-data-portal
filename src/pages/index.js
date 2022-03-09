import Head from 'next/head';
import Welcome from '/src/components/Welcome';
import {useEffect, useState} from 'react';
import { UNITS as TEMP_UNITS } from 'src/lib/units/temperature';
import { UNITS as COND_UNITS } from 'src/lib/units/conductivity';
import Navbar from 'src/components/Navbar'
import Preferences from "../components/Preferences";


const locations = [ /* fetch from api */
    { id: 1, name: 'Trossö',  lat: 43, long: 23, radius: 300 },
    { id: 2, name: 'Gräsvik', lat: 43, long: 23, radius: 300 },
    { id: 3, name: 'Saltö',   lat: 43, long: 23, radius: 300 },
    { id: 4, name: 'Hästö',   lat: 43, long: 23, radius: 300 },
];

export const getServerSideProps = async (ctx) => {
    /* const data = fetcher('/api/v1', queryOptions) */
    /* const locations = fetcher('/api/v1/locations') */
    const loadPreferences = (cookies) => {
        /* load preferences from cookies, or fallback to default values */
        let json;
        try {
            json = JSON.parse(cookies);
        } catch (e) {}
        return {
            location: json?.location ||                   { name: locations[0].name,                 symbol: locations[0].name },
            temperature_unit:  json?.temperature_unit ||  { name: TEMP_UNITS.CELSIUS.name,           symbol: TEMP_UNITS.CELSIUS.symbol },
            conductivity_unit: json?.conductivity_unit || { name: COND_UNITS.PARTS_PER_MILLION.name, symbol: COND_UNITS.PARTS_PER_MILLION.symbols[0] }
        }
    };

    return {
        props: {
            // initialData: data,
            initialPreferences: loadPreferences(ctx.req.cookies.preferences),
            locations,
        }
    }
};

export default function Home({ initialPreferences, locations }) {
    const [preferences, setPreferences] = useState(initialPreferences);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => console.log(preferences.location), [preferences.location])

    return (
        <div>
            <Head>
                <title>Open Data Portal</title>
                <meta name="description" content="Data portal for Karlskrona Archipelago Water Quality" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Navbar openModal={() => setIsOpen(true)}/>
                {isOpen &&
                    <Preferences
                        preferences={preferences}
                        setPreferences={setPreferences}
                        locations={locations}
                        closeModal={() => setIsOpen(false)}
                        isOpen={isOpen}
                    />
                }
                <Welcome />
            </main>
        </div>
  );
}

