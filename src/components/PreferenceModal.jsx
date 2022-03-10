import {Autocomplete, Button, TextField} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import Modal from 'react-modal'
Modal.setAppElement('#__next');
import { useContext, useMemo, useState } from "react";

import Cookies from "js-cookie";

import { UNITS as TEMP_UNITS } from "src/lib/units/temperature";
import { UNITS as COND_UNITS } from "src/lib/units/conductivity";
import { PreferenceContext } from "src/pages/_app";

export default function ({ setPreferences, closeModal, isOpen }) {
    const preferences = useContext(PreferenceContext);      /* <-- global preferences from _app-context-provider */
    const [tempPref, setTempPref] = useState(preferences);  /* <-- local preferences while modal is open */
    const preferenceOptions = useMemo(() => {
        const locations = [ /* should be fetched from api when that is implemented */
            { id: 1, name: 'Trossö',  lat: 43, long: 23, radius: 300 },
            { id: 2, name: 'Gräsvik', lat: 43, long: 23, radius: 300 },
            { id: 3, name: 'Saltö',   lat: 43, long: 23, radius: 300 },
            { id: 4, name: 'Hästö',   lat: 43, long: 23, radius: 300 },
        ];
        return [
            { name: 'Location',     key: 'location',          options:                 locations.map(l => ({name: l.name, symbol: l.name})),       default: preferences.location },
            { name: 'Temperature',  key: 'temperature_unit',  options: Object.values(TEMP_UNITS).map(u => ({name: u.name, symbol: u.symbol})),     default: preferences.temperature_unit },
            { name: 'Conductivity', key: 'conductivity_unit', options: Object.values(COND_UNITS).map(u => ({name: u.name, symbol: u.symbols[0]})), default: preferences.conductivity_unit }
        ]
    }, [preferences]);


    const handleChange = (key, val) => {
        const updated = {...tempPref};
        updated[key] = val;
        setTempPref(updated);
    }

    const savePreferences = () => {
        setPreferences(tempPref);
        Cookies.set('preferences', JSON.stringify(tempPref));
        closeModal();
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className={'preferences-modal'}
        >
            <CloseIcon sx={{fontSize: 30, right: 5, top: 5, position: 'absolute', cursor: 'pointer'}} onClick={closeModal} />

            {preferenceOptions.map((p, idx) => (
                <div className="modal-options" key={idx}>
                    <p>{p.name}</p>
                    <Autocomplete
                        options={p.options}
                        renderInput={ params => <TextField {...params}/> }
                        getOptionLabel={o => o.name}
                        renderOption={(props, option) => <div {...props}>{option.name}</div> }
                        defaultValue={p.default}
                        isOptionEqualToValue={(option, value) => value.symbol === option.symbol}
                        onChange={(e, val) => handleChange(p.key, val)}
                    />
                </div>
            ))}

            <div className={"modal-option"} style={{display: 'flex', justifyContent: 'center', marginTop: 20}}>
                <Button color='primary' variant='contained' onClick={() => savePreferences()}>Save Preferences</Button>
            </div>
        </Modal>
    );
}