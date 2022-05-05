import { useContext, useMemo, useState, Dispatch, SetStateAction } from "react";
import Cookies from "js-cookie";
import Modal from "react-modal";

import { Autocomplete, Button, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { UNITS as TEMP_UNITS } from "~/lib/units/temperature";
import { UNITS as COND_UNITS } from "~/lib/units/conductivity";
import { PreferenceContext, Preferences } from "~/lib/utils/preferences";
import style from "~/styles/PreferenceModal.module.css";

Modal.setAppElement("#__next");

const PreferenceModal: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  setPreferences: Dispatch<SetStateAction<Preferences>>;
}> = ({ setPreferences, closeModal, isOpen }) => {
  const { preferences, locations } = useContext(PreferenceContext);
  const [tempPref, setTempPref] = useState(preferences);
  const preferenceOptions = useMemo(() => {
    const options = [
      {
        name: "Temperature",
        key: "temperatureUnit",
        options: Object.values(TEMP_UNITS).map((u) => ({
          name: u.name,
          symbol: u.symbol,
        })),
        default: preferences.temperatureUnit,
      },
      {
        name: "Conductivity",
        key: "conductivityUnit",
        options: Object.values(COND_UNITS).map((u) => ({
          name: u.name,
          symbol: u.symbols[0],
        })),
        default: preferences.conductivityUnit,
      },
    ];
    if (locations) {
      options.push({
        name: "Location",
        key: "location",
        options: [
          { name: "Everywhere", symbol: "Everywhere" },
          ...locations.map((l) => ({ name: l.name, symbol: l.name })),
        ],
        default: preferences.location,
      });
    }
    return options;
  }, [locations, preferences]);

  const savePreferences = () => {
    setPreferences(tempPref);
    Cookies.set("preferences", JSON.stringify(tempPref));
    closeModal();
  };

  return (
    <Modal
      closeTimeoutMS={500}
      isOpen={isOpen}
      onRequestClose={closeModal}
      className={style.preferenceModal}
    >
      <CloseIcon
        sx={{
          fontSize: 30,
          right: 5,
          top: 5,
          position: "absolute",
          cursor: "pointer",
        }}
        onClick={closeModal}
      />

      {preferenceOptions.map((p, idx) => (
        <div className={style.modalOption} key={idx}>
          <p>{p.name}</p>
          <Autocomplete
            options={p.options}
            renderInput={(params) => <TextField {...params} />}
            getOptionLabel={(o) => o.name}
            renderOption={(props, option) => <div>{option.name}</div>}
            defaultValue={p.default}
            isOptionEqualToValue={(option, value) =>
              value.symbol === option.symbol
            }
            onChange={(e, val) =>
              setTempPref((prev) => ({
                ...prev,
                [p.key]: val,
              }))
            }
          />
        </div>
      ))}

      <div className={style.buttonContainer}>
        <Button
          sx={{ backgroundColor: "#185693" }}
          variant="contained"
          onClick={() => savePreferences()}
        >
          Save Preferences
        </Button>
      </div>
    </Modal>
  );
};

export default PreferenceModal;
