import SettingsIcon from '@mui/icons-material/Settings';
import WavesIcon from '@mui/icons-material/Waves';
import HomeIcon from '@mui/icons-material/Home';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GitHubIcon from '@mui/icons-material/GitHub';

import Link from 'next/link';
import { useState } from 'react';

import PreferenceModal from 'src/components/PreferenceModal';

const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid black',
    width: '100%',
}

const headerStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '0 15px',
}

const navItemStyle = {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px',
}

const ICON_SIZE = 30;
const ICON_COLOR = '#1976d2';

export default function Navbar ({ setPreferences }) {
    const [isOpen, setIsOpen] = useState(false);
    const closePreferenceModal = () => setIsOpen(false);
    const openPreferenceModal = () => setIsOpen(true);

    return (
        <>
            <div className="nav" style={navStyle}>
                <div className="nav-left" style={headerStyle}>
                    <div className={'nav-item'} style={navItemStyle}>
                        <WavesIcon sx={{ fontSize: ICON_SIZE, color: ICON_COLOR }}/>
                    </div>
                    <h2>Sensor Network</h2>
                </div>

                <div className="nav-right" style={{ display: 'flex' }}>
                    <Link href={'/'}>
                        <div className="nav-item" style={navItemStyle}>
                            <HomeIcon sx={{ fontSize: ICON_SIZE, color: ICON_COLOR }}/>
                        </div>
                    </Link>
                    <Link href={'/docs'}>
                        <div className="nav-item" style={navItemStyle}>
                            <LibraryBooksIcon sx={{ fontSize: ICON_SIZE, color: ICON_COLOR }}/>
                        </div>
                    </Link>
                    <Link href={'https://github.com/sensor-network/open-data-portal'} >
                        <div className="nav-item" style={navItemStyle}>
                            <GitHubIcon sx={{ fontSize: ICON_SIZE, color: ICON_COLOR }}/>
                        </div>
                    </Link>
                    <div className={'nav-item'} style={navItemStyle} onClick={openPreferenceModal}>
                        <SettingsIcon sx={{ fontSize: ICON_SIZE, color: ICON_COLOR }}/>
                    </div>
                </div>
            </div>
            {isOpen && <PreferenceModal isOpen={isOpen} closeModal={closePreferenceModal} setPreferences={setPreferences}/>}
        </>
    );
}