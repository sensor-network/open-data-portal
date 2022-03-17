import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {useContext, useState} from "react";
import {AreaChart, Area, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {PreferenceContext} from "src/pages/_app";

import style from 'src/styles/AreaChart.module.css'

const CustomAreaChart = ({ data }) => {
    const preferences = useContext(PreferenceContext)
    const [showTemperature, setShowTemperature] = useState(true);
    const [showConductivity, setShowConductivity] = useState(false);
    const [showPH, setShowPH] = useState(false);
    const xTickInterval = Math.floor(data.length / 15);

    const getMonthYear = (tick) => {
        const date = new Date(tick);
        return date.toLocaleString(undefined, {month: 'short', year: 'numeric'})
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const formattedDate = new Date(label).toLocaleString();
            return (
                <div className={style.chartToolTip}>
                    <div className={style.dataLabel}>
                        <h4>Measured at</h4>
                        <p>{formattedDate}</p>
                    </div>
                    <div className={style.dataPayload}>
                        {payload.map(row => {
                            /** FIXME
                             * shady way to extract the preference key from the `dataKey`-property,
                             * also, take care for values not in the preferences
                            **/
                            let unit = preferences[`${row.dataKey}_unit`] && preferences[`${row.dataKey}_unit`].symbol;
                            if (unit && row.dataKey === 'temperature') unit = unit.toUpperCase();
                            return (
                                <p key={row.name}>

                                    <strong>{row.name}:</strong> {row.value}{unit}
                                </p>
                            );
                        })}
                    </div>

                </div>
            );
        }
        return null;
    };

    return (
        <>
            <div style={{ width: '95%', maxWidth: 1000 }}>
                <FormControlLabel
                    onChange={(e) => setShowTemperature(e.target.checked)}
                    control={<Checkbox defaultChecked />} label="Temperature"
                />
                <FormControlLabel
                    onChange={(e) => setShowConductivity(e.target.checked)}
                    control={<Checkbox />}
                    label="Conductivity"
                />
                <FormControlLabel
                    onChange={(e) => setShowPH(e.target.checked)}
                    control={<Checkbox />}
                    label="PH"
                />
            </div>

            <div style={{ height: 750, width: '95%', maxWidth: 1000, paddingTop: 30 }}>
                <ResponsiveContainer width='100%' height="80%" margin={{top: 0, right: 0, left: 0, bottom: 0}}>
                    <AreaChart data={data}
                               margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1565c0" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#1565c0" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPH" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#A83636FF" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#A83636FF" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCond" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#A4C42FFF" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#A4C42FFF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date" tickFormatter={getMonthYear}
                            interval={() => xTickInterval()} angle={-15} height={30}
                        />
                        <YAxis margin={{top: 0, right: 0, left: 0, bottom: 0}}/>
                        <Legend verticalAlign="top" height={36}/>
                        <Tooltip content={CustomTooltip} />
                        {showTemperature &&
                            <Area connectNulls type="monotone" dataKey="temperature" name="Temperature" stroke="#1565c0" fillOpacity={1} fill="url(#colorTemp)" />
                        }
                        {showPH &&
                            <Area connectNulls type="monotone" dataKey="ph" stroke="#A83636FF" fillOpacity={1} fill="url(#colorPH)" />
                        }
                        {showConductivity &&
                            <Area connectNulls type="monotone" dataKey="conductivity" name="Conductivity" stroke="#A4C42FFF" fillOpacity={1} fill="url(#colorCond)" />
                        }
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </>
    );
};

export default CustomAreaChart;