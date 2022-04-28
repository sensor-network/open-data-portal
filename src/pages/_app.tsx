import "src/styles/globals.css";
import { AppType } from "next/dist/shared/lib/utils";
import NextNProgress from "nextjs-progressbar";
import { createContext, useState } from "react";
import Cookies from "js-cookie";

import Navbar from "src/components/Navbar";
import Footer from "src/components/Footer";
import { loadPreferences } from "~/lib/utils/load-preferences";
import { useWidth } from "../lib/hooks/useWidth";
import { useLocations } from "../lib/hooks/useLocations";
import type { Location } from "~/lib/database/location";
import type { Preferences } from "~/lib/utils/load-preferences";

export type PreferenceContextType = {
  preferences: Preferences;
  locations: Location[] | undefined;
};
export const PreferenceContext = createContext<PreferenceContextType>(
  {} as PreferenceContextType
);
export const NAV_HEIGHT = 60;
const MOBILE_BREAKPOINT = 768;

const MyApp: AppType = ({ Component, pageProps }) => {
  const [preferences, setPreferences] = useState(() =>
    loadPreferences(Cookies.get("preferences") ?? "")
  );
  const locations = useLocations("/api/v3/locations");
  const width = useWidth();
  const isMobile = width < MOBILE_BREAKPOINT;

  return (
    <>
      <NextNProgress
        color={"#185693"}
        height={8}
        options={{ showSpinner: false }}
      />
      <PreferenceContext.Provider value={{ preferences, locations }}>
        <Navbar
          isMobile={isMobile}
          height={NAV_HEIGHT}
          setPreferences={setPreferences}
        />
        <div
          style={{
            paddingTop: isMobile ? 0 : NAV_HEIGHT,
            paddingBottom: !isMobile ? 0 : NAV_HEIGHT,
          }}
        >
          <Component {...pageProps} />
        </div>
      </PreferenceContext.Provider>
      <Footer />
    </>
  );
};

export default MyApp;
