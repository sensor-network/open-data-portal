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
                <Welcome />
            </main>
        </div>
  );
}

