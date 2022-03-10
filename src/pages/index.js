import Head from 'next/head';
import {useContext, useEffect, useState} from 'react';

import Welcome from '/src/components/Welcome';
import { loadPreferences } from "src/lib/loadPreferences";
import {PreferenceContext} from "./_app";


export const getServerSideProps = async (ctx) => {
    const preferences = loadPreferences(ctx.req.cookies.preferences);
    /* const data = fetcher('/api/v1', preferences) */
    /* const locations = fetcher('/api/v1/locations') */

    return {
        props: {
            // initialData: data,
        }
    }
};

export default function Home() {
    const preferences = useContext(PreferenceContext);

    return (
        <div>
            <Head>
                <title>Open Data Portal</title>
                <meta name="description" content="Data portal for Karlskrona Archipelago Water Quality" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                {/* preferences are updated using state, test by changing it in the preference modal */}
                <p>Your preferred location is: <strong>{preferences.location.name}</strong></p>
                <p>Temperature is displayed in: <strong>{preferences.temperature_unit.name}</strong> ({preferences.temperature_unit.symbol})</p>
                <p>Conductivity is displayed in: <strong>{preferences.conductivity_unit.name}</strong> ({preferences.conductivity_unit.symbol})</p>
                <Welcome />
            </main>
        </div>
  );
}

