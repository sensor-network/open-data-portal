import {Autocomplete, Button, TextField} from "@mui/material";
import { UNITS as TEMP_UNITS } from "../lib/units/temperature";
import { UNITS as COND_UNITS } from "../lib/units/conductivity";
import Cookies from "js-cookie";
import CloseIcon from "@mui/icons-material/Close";
import Modal from 'react-modal'
import {useEffect, useState} from "react";

Modal.setAppElement('#__next');

export default function ({ preferences, setPreferences, locations, closeModal, isOpen }) {
    const [tempPref, setTempPref] = useState(preferences);
    const [prefOptions, setPrefOptions] = useState([]);
    useEffect(() => {
        console.log("running effect")
        setPrefOptions([
            { name: 'Location',     key: 'location',          options:                 locations.map(l => ({name: l.name, symbol: l.name})),       default: preferences.location },
            { name: 'Temperature',  key: 'temperature_unit',  options: Object.values(TEMP_UNITS).map(u => ({name: u.name, symbol: u.symbol})),     default: preferences.temperature_unit },
            { name: 'Conductivity', key: 'conductivity_unit', options: Object.values(COND_UNITS).map(u => ({name: u.name, symbol: u.symbols[0]})), default: preferences.conductivity_unit }
        ])
    }, []);

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

            {prefOptions.map((p, idx) => (
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