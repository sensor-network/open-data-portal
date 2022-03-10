import SettingsIcon from '@mui/icons-material/Settings';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GitHubIcon from '@mui/icons-material/GitHub';
import Link from 'next/link';

const navItemStyle = {
    cursor: 'pointer',
    padding: '10px',
    height: '60px',
    width: '60px',
    color: 'black',
}
const ICON_SIZE = 30;

export default function Navbar ({ openModal }) {
    return (
        <div className={'nav'} style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'row',
            height: 'max-content',
            right: 0,
            top: 0,
        }}>

            <Link
                href={'/docs'}
            >
                <div className="nav-item" style={navItemStyle}>
                    <LibraryBooksIcon sx={{fontSize: ICON_SIZE}}/>
                </div>
            </Link>

            <Link
                href={'https://github.com/sensor-network/open-data-portal'}
            >
                <div className="nav-item" style={navItemStyle}>
                    <GitHubIcon sx={{fontSize: ICON_SIZE}}/>
                </div>
            </Link>


            <div className={'nav-item'} style={navItemStyle} onClick={openModal}>
                    <SettingsIcon sx={{fontSize: ICON_SIZE}}/>
            </div>
        </div>
    );
}