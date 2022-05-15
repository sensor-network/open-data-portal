import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";

import SettingsIcon from "@mui/icons-material/Settings";
import WavesIcon from "@mui/icons-material/Waves";
import HomeIcon from "@mui/icons-material/Home";
import EqualizerIcon from "@mui/icons-material/BarChart";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import GitHubIcon from "@mui/icons-material/GitHub";
import MapIcon from "@mui/icons-material/Map";
import PortableWifiOffIcon from "@mui/icons-material/PortableWifiOff";

import type { Preferences } from "~/lib/utils/preferences";
import PreferenceModal from "./PreferenceModal";
import style from "~/styles/Nav.module.css";

const NavLink: React.FC<{
  title?: string;
  href: string;
  text?: string;
  Icon: any; // <-- fix type
}> = ({ title, text, href, Icon }) => {
  return (
    <Link passHref href={href} key={href}>
      <div className={style.navItem}>
        <Icon className={style.icon} />
        {text && <h4 className={style.header}>{text}</h4>}
        {title && <h3 className={style.header}>{title}</h3>}
      </div>
    </Link>
  );
};

const NavButton: React.FC<{
  text?: string;
  Icon: any;
  onClick: () => void;
}> = ({ text, onClick, Icon }) => {
  return (
    <div className={style.navItem} onClick={onClick}>
      <Icon className={style.icon} />
      {text && <h4 className={style.header}>{text}</h4>}
    </div>
  );
};

const Navbar: React.FC<{
  setPreferences: Dispatch<SetStateAction<Preferences>>;
  height: number;
  isMobile: boolean;
}> = ({ setPreferences, height, isMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const closePreferenceModal = () => setIsOpen(false);
  const openPreferenceModal = () => setIsOpen(true);

  return (
    <nav>
      <div
        className={style.nav}
        style={{ height, top: 0, position: isMobile ? "relative" : "fixed" }}
      >
        <div className={style.navHalf}>
          <NavLink title="Sensor Network" href="/" Icon={WavesIcon} />
        </div>
        <div className={style.navHalf}>
          {!isMobile && (
            <>
              <NavLink text="Map" href="/map" Icon={MapIcon} />
              <NavLink
                text="Visualize Data"
                href="/data"
                Icon={EqualizerIcon}
              />
              <NavLink
                text="Status Panel"
                href="/admin"
                Icon={PortableWifiOffIcon}
              />
              <NavLink text="API Docs" href="/docs" Icon={LibraryBooksIcon} />
            </>
          )}
          <NavLink
            href="https://github.com/sensor-network/open-data-portal"
            Icon={GitHubIcon}
          />
          <NavButton onClick={openPreferenceModal} Icon={SettingsIcon} />
        </div>
      </div>

      {isMobile && (
        <div
          className={style.nav}
          style={{ bottom: 0, justifyContent: "space-evenly" }}
        >
          <NavLink href="/" Icon={HomeIcon} />
          <NavLink href="/map" Icon={MapIcon} />
          <NavLink href="/data" Icon={EqualizerIcon} />
          <NavLink href="/admin" Icon={PortableWifiOffIcon} />
          <NavLink href="/docs" Icon={LibraryBooksIcon} />
        </div>
      )}

      {isOpen && (
        <PreferenceModal
          isOpen={isOpen}
          closeModal={closePreferenceModal}
          setPreferences={setPreferences}
        />
      )}
    </nav>
  );
};

export default Navbar;
