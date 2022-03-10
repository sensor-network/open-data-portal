import 'src/styles/globals.css';
import NextNProgress from 'nextjs-progressbar';
import { createContext, useState } from 'react';
import Cookies from 'js-cookie';

import Navbar from 'src/components/Navbar';
import { loadPreferences } from 'src/lib/loadPreferences';

export const PreferenceContext = createContext();

function MyApp({ Component, pageProps }) {
    const [preferences, setPreferences] = useState(() => (
        loadPreferences(Cookies.get('preferences'))
    ));
    return (
        <>
            <NextNProgress color={"#1976d2"} height={5} options={{ showSpinner: false }} />
            <PreferenceContext.Provider value={preferences}>
                <Navbar setPreferences={setPreferences}/>
                <Component {...pageProps} />
            </PreferenceContext.Provider>
        </>
    );
}

export default MyApp;
