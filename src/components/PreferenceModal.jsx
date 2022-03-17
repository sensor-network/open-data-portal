import {Autocomplete, Button, TextField} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import Modal from 'react-modal'
Modal.setAppElement('#__next');
import { useContext, useMemo, useState } from "react";

import Cookies from "js-cookie";

import { UNITS as TEMP_UNITS } from "src/lib/units/temperature";
import { UNITS as COND_UNITS } from "src/lib/units/conductivity";
import { PreferenceContext } from "src/pages/_app";
import style from 'src/styles/PreferenceModal.module.css';

export default function ({ setPreferences, closeModal, isOpen }) {
    const { preferences, locations } = useContext(PreferenceContext);      /* <-- global preferences from _app-context-provider */
    const [tempPref, setTempPref] = useState(preferences);  /* <-- local preferences while modal is open */
    const preferenceOptions = useMemo( () => {
        return [
            { name: 'Location',     key: 'location',          options: [{name: 'Everywhere', symbol: 'all'}, ...locations.map(l => ({name: l.name, symbol: l.name}))], default: preferences.location },
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
            closeTimeoutMS={500}
            isOpen={isOpen}
            onRequestClose={closeModal}
            className={style.preferenceModal}
        >
            <CloseIcon sx={{fontSize: 30, right: 5, top: 5, position: 'absolute', cursor: 'pointer'}} onClick={closeModal} />

            {preferenceOptions.map((p, idx) => (
                <div className={style.modalOption} key={idx}>
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

            <div className={style.buttonContainer}>
                <Button sx={{backgroundColor: '#185693'}} variant='contained' onClick={() => savePreferences()}>Save Preferences</Button>
            </div>
        </Modal>
    );
}