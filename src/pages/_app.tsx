import type { AppType } from "next/dist/shared/lib/utils";
import NextNProgress from "nextjs-progressbar";
import { useState } from "react";
import Cookies from "js-cookie";

import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { loadPreferences, PreferenceContext } from "~/lib/utils/preferences";
import {
  NAV_HEIGHT,
  MOBILE_BREAKPOINT,
  PRIMARY_BLUE_COLOR,
} from "~/lib/constants";
import { useWidth, useLocations } from "~/lib/hooks";

import "~/styles/globals.css";

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
        color={PRIMARY_BLUE_COLOR}
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
